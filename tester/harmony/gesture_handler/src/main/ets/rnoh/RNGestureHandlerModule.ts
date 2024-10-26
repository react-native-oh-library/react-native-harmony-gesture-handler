import { UITurboModule, UITurboModuleContext, Tag } from "@rnoh/react-native-openharmony/ts";
import { TM } from "@rnoh/react-native-openharmony/generated/ts"
import {
  GestureHandlerRegistry,
  State,
  OutgoingEventDispatcher,
  RNGHLogger,
  InteractionManager,
  ViewRegistry
} from '../core';
import { GestureHandlerFactory } from "../gesture-handlers"
import { RNGHViewRegistry } from './RNGHViewRegistry';
import { DevelopmentRNGHLogger, ProductionRNGHLogger } from './Logger';
import { JSEventDispatcher, AnimatedEventDispatcher, ReanimatedEventDispatcher } from './OutgoingEventDispatchers'
import { RNOHScrollLockerCAPI } from "./RNOHScrollLocker"
import { RNGHRootViewController, RawTouchEvent } from "./RNGHRootViewController"
import { RNGHView } from "./RNGHView"
import { RNOHGestureResponder } from "./RNOHGestureResponder"

export enum ActionType {
  REANIMATED_WORKLET = 1,
  NATIVE_ANIMATED_EVENT = 2,
  JS_FUNCTION_OLD_API = 3,
  JS_FUNCTION_NEW_API = 4,
}


export class RNGestureHandlerModule extends UITurboModule implements TM.RNGestureHandlerModule.Spec {
  static readonly NAME = "RNGestureHandlerModule"

  private gestureHandlerRegistry: GestureHandlerRegistry
  private gestureHandlerFactory: GestureHandlerFactory | undefined = undefined
  private viewRegistry: ViewRegistry | undefined = undefined
  private logger: RNGHLogger
  private cleanLogger: RNGHLogger
  private rootViewControllerByRootTag = new Map<Tag, RNGHRootViewController>()
  private interactionManager: InteractionManager

  constructor(ctx: UITurboModuleContext, isDevModeEnabled: boolean = false) {
    super(ctx)
    this.cleanLogger =
      isDevModeEnabled && ctx.isDebugModeEnabled ? new DevelopmentRNGHLogger(ctx.logger, "RNGH") :
        new ProductionRNGHLogger(ctx.logger, "RNGH")
    this.logger = this.cleanLogger.cloneAndJoinPrefix("RNGestureHandlerModule")
    const logger = this.logger.cloneAndJoinPrefix("constructor")
    const stopTracing = logger.startTracing()
    this.interactionManager = new InteractionManager(this.cleanLogger)
    this.gestureHandlerRegistry = new GestureHandlerRegistry(this.viewRegistry, this.cleanLogger)
    if (this.ctx.rnInstance.getArchitecture() === "C_API") {
      this.ctx.rnInstance.cppEventEmitter.subscribe("RNGH::TOUCH_EVENT", (e: any) => {
        this.onTouch(e)
      })
      this.ctx.rnInstance.cppEventEmitter.subscribe("RNGH::ROOT_CREATED", (rootTag: any) => {
        this.onGHRootCreated(rootTag)
      })
      this.ctx.rnInstance.cppEventEmitter.subscribe("RNGH::CANCEL_TOUCHES", (rootTag: any) => {
        const touchHandler = this.rootViewControllerByRootTag.get(rootTag)
        touchHandler?.cancelTouches()
      })
    }
    stopTracing()
  }

  /**
   * Called from C++.
   */
  private onGHRootCreated(rootTag: Tag) {
    const stopTracing = this.logger.cloneAndJoinPrefix("onGHRootCreated").startTracing()
    this.rootViewControllerByRootTag.set(rootTag, new RNGHRootViewController(this.logger, this.gestureHandlerRegistry));
    stopTracing()
  }

  /**
   * Called from C++.
   */
  private onTouch(e: RawTouchEvent & { rootTag: Tag }) {
    const logger = this.logger.cloneAndJoinPrefix("onTouch")
    const stopTracing = logger.startTracing();
    (() => {
      if (!(this.viewRegistry instanceof RNGHViewRegistry)) {
        logger.error("Expected ViewRegistryCAPI")
        return;
      }
      const rootViewController = this.rootViewControllerByRootTag.get(e.rootTag)
      if (!rootViewController) {
        logger.error(`Couldn't find a rootViewController for a gesture root tag: ${e.rootTag}`)
        return;
      }
      // update view registry
      e.touchableViews.forEach(touchableView => {
        const view = this.viewRegistry.getViewByTag(touchableView.tag)
        if (view) {
          if (!(view instanceof RNGHView)) {
            logger.error(`Expected ViewCAPI`)
            return
          }
          view.updateBoundingBox(touchableView)
          view.setButtonRole(touchableView.buttonRole)
        } else {
          this.viewRegistry.save(new RNGHView(touchableView))
        }
      })
      rootViewController.handleTouch(e, e.touchableViews.map(({ tag }) => this.viewRegistry.getViewByTag(tag)));
    })()
    stopTracing()
  }

  // -------------------------------------------------------------------------------------------------------------------

  public install() {
    const stopTracing = this.ctx.logger.clone("install").startTracing()
    this.viewRegistry = new RNGHViewRegistry()
    const scrollLocker = new RNOHScrollLockerCAPI(this.ctx.rnInstance, this.cleanLogger);
    const rnGestureResponder = new RNOHGestureResponder(this.ctx.rnInstance)
    this.gestureHandlerFactory =
      new GestureHandlerFactory(this.cleanLogger, scrollLocker, this.interactionManager, rnGestureResponder)
    stopTracing()
    return true
  }

  public createGestureHandler(
    handlerName: string,
    handlerTag: number,
    config: Readonly<Record<string, unknown>>
  ) {
    const logger = this.logger.cloneAndJoinPrefix("createGestureHandler")
    const stopTracing = logger.startTracing();
    (() => {
      if (!this.gestureHandlerFactory) {
        logger.error("Trying to create a gesture handler before creating gesture handler factory")
        return
      }
      logger.debug({ handlerName, handlerTag, config })
      const gestureHandler = this.gestureHandlerFactory.create(handlerName, handlerTag)
      this.gestureHandlerRegistry.addGestureHandler(gestureHandler)
      this.interactionManager.configureInteractions(gestureHandler, config);
      gestureHandler.updateGestureConfig(config)
    })()
    stopTracing()
  }

  public attachGestureHandler(
    handlerTag: number,
    viewTag: number,
    actionType: ActionType
  ) {
    const logger = this.logger.cloneAndJoinPrefix("attachGestureHandler")
    const stopTracing = logger.startTracing();
    (() => {
      const eventDispatcher = this.createEventDispatcher(actionType, viewTag)
      if (!eventDispatcher) {
        logger.error("RNGH: Couldn't create EventDispatcher")
        return
      }
      const viewRegistry = this.viewRegistry
      let view = this.viewRegistry.getViewByTag(viewTag)
      if (!view && viewRegistry instanceof RNGHViewRegistry) {
        view = new RNGHView({
          tag: viewTag,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          buttonRole: false
        })
        viewRegistry.save(view)
      }
      if (!view) {
        logger.error("Expected view")
        return;
      }
      this.gestureHandlerRegistry.bindGestureHandlerWithView(handlerTag, view)
      this.gestureHandlerRegistry.getGestureHandlersByViewTag(view.getTag()).forEach((handler) => {
        if (handler.isGestureContinuous() && eventDispatcher instanceof JSEventDispatcher) {
          logger.warn(`Using JSEventDispatcher for a continuous gesture (${handler.getName()}). Gesture-driven animations may not be smooth. Consider using Animated.event.`)
        }
      })
      this.gestureHandlerRegistry
        .getGestureHandlerByHandlerTag(handlerTag)
        .setEventDispatcher(eventDispatcher)
    })()
    stopTracing()
  }

  private createEventDispatcher(actionType: ActionType, viewTag: number): OutgoingEventDispatcher | null {
    switch (actionType) {
      case ActionType.REANIMATED_WORKLET:
        return new ReanimatedEventDispatcher(this.ctx.rnInstance,
          this.cleanLogger, viewTag)
      case ActionType.NATIVE_ANIMATED_EVENT:
        return new AnimatedEventDispatcher(this.ctx.rnInstance,
          this.cleanLogger, viewTag)
      case ActionType.JS_FUNCTION_OLD_API:
      case ActionType.JS_FUNCTION_NEW_API:
        return new JSEventDispatcher(this.ctx.rnInstance, this.cleanLogger);
    }
  }

  public updateGestureHandler(
    handlerTag: number,
    newConfig: Readonly<Record<string, unknown>>
  ) {
    const stopTracing = this.logger.cloneAndJoinPrefix("updateGestureHandler").startTracing()
    const gestureHandler = this.gestureHandlerRegistry.getGestureHandlerByHandlerTag(handlerTag)
    this.interactionManager.configureInteractions(gestureHandler, newConfig);
    gestureHandler.updateGestureConfig(newConfig)
    stopTracing()
  }

  public dropGestureHandler(handlerTag: number) {
    const stopTracing = this.logger.cloneAndJoinPrefix("dropGestureHandler").startTracing()
    this.interactionManager.dropRelationsForHandlerWithTag(handlerTag)
    this.gestureHandlerRegistry.removeGestureHandlerByHandlerTag(handlerTag)
    stopTracing()
  }

  public handleSetJSResponder(tag: number, blockNativeResponder: boolean) {
    this.logger.cloneAndJoinPrefix("handleSetJSResponder").warn("not implemented")
  }

  public handleClearJSResponder() {
    this.logger.cloneAndJoinPrefix("handleClearJSResponder").warn("not implemented")
  }

  public flushOperations() {
    // no-op
  }

  // -------------------------------------------------------------------------------------------------------------------

  public getGestureHandlerRegistry() {
    return this.gestureHandlerRegistry
  }

  public getLogger() {
    return this.logger
  }

  public getViewRegistry() {
    if (!this.viewRegistry) {
      this.logger.error("Tried to get viewRegistry before it was initialized")
      throw new Error("Tried to get viewRegistry before it was initialized")
    }
    return this.viewRegistry
  }

  public setGestureHandlerState(handlerTag: number, newState: State) {
    const handler = this.getGestureHandlerRegistry().getGestureHandlerByHandlerTag(handlerTag);
    switch (newState) {
      case State.ACTIVE:
        handler.activate();
        break;
      case State.BEGAN:
        handler.begin();
        break;
      case State.END:
        handler.end();
        break;
      case State.FAILED:
        handler.fail();
        break;
      case State.CANCELLED:
        handler.cancel();
        break;
    }
  }
}
