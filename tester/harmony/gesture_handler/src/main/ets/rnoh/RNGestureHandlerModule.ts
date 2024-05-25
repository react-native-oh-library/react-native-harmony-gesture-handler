import { TurboModule, TurboModuleContext, Tag } from "@rnoh/react-native-openharmony/ts";
import { RNGestureHandlerModule as TM } from "../namespace/RNGestureHandlerModule"
import { GestureHandlerRegistry, State, OutgoingEventDispatcher, RNGHLogger, InteractionManager } from '../core';
import { GestureHandlerFactory } from "../gesture-handlers"
import { ViewRegistry, ViewRegistryArkTS, ViewRegistryCAPI } from './ViewRegistry';
import { StandardRNGHLogger, FakeRNGHLogger } from './Logger';
import { JSEventDispatcher, AnimatedEventDispatcher, ReanimatedEventDispatcher } from './OutgoingEventDispatchers'
import { RNOHScrollLockerArkTS, RNOHScrollLockerCAPI } from "./RNOHScrollLocker"
import { RNGHRootTouchHandlerCAPI, RawTouchEvent } from "./RNGHRootTouchHandlerCAPI"
import { RNGHRootTouchHandlerArkTS } from './RNGHRootTouchHandlerArkTS';
import { ViewCAPI } from "./View"
import { FakeRNGestureResponder, RNOHGestureResponder } from "./RNOHGestureResponder"

export enum ActionType {
  REANIMATED_WORKLET = 1,
  NATIVE_ANIMATED_EVENT = 2,
  JS_FUNCTION_OLD_API = 3,
  JS_FUNCTION_NEW_API = 4,
}


export class RNGestureHandlerModule extends TurboModule implements TM.Spec {
  static NAME = "RNGestureHandlerModule"

  private gestureHandlerRegistry: GestureHandlerRegistry
  private gestureHandlerFactory: GestureHandlerFactory | undefined = undefined
  private viewRegistry: ViewRegistry | undefined = undefined
  private logger: RNGHLogger
  private touchHandlerByRootTag = new Map<Tag, RNGHRootTouchHandlerCAPI>()
  private interactionManager: InteractionManager

  constructor(ctx: TurboModuleContext) {
    super(ctx)
    const debug = false
    this.logger = debug ? new StandardRNGHLogger(ctx.logger, "RNGH") : new FakeRNGHLogger()
    this.interactionManager = new InteractionManager(this.logger)
    this.gestureHandlerRegistry = new GestureHandlerRegistry(this.logger)

    if (this.ctx.rnInstance.getArchitecture() === "C_API") {
      this.ctx.rnInstance.cppEventEmitter.subscribe("RNGH::TOUCH_EVENT", (e: any) => {
        this.onTouch(e)
      })
      this.ctx.rnInstance.cppEventEmitter.subscribe("RNGH::ROOT_CREATED", (rootTag: any) => {
        this.onGHRootCreated(rootTag)
      })
    }
  }

  /**
   * @architecture: C-API
   * Called from C++.
   */
  private onGHRootCreated(rootTag: Tag) {
    this.touchHandlerByRootTag.set(rootTag, new RNGHRootTouchHandlerCAPI(this.logger, new RNGHRootTouchHandlerArkTS(rootTag, this.viewRegistry, this.gestureHandlerRegistry, this.logger)));
  }

  /**
   * @architecture: C-API
   * Called from C++.
   */
  private onTouch(e: RawTouchEvent & { rootTag: Tag }) {
    const logger = this.logger.cloneWithPrefix("onTouch")
    if (!(this.viewRegistry instanceof ViewRegistryCAPI)) {
      logger.error("Expected ViewRegistryCAPI")
      return;
    }
    const touchHandler = this.touchHandlerByRootTag.get(e.rootTag)
    if (!touchHandler) {
      logger.error(`Couldn't find touch handler for gesture root tag: ${e.rootTag}`)
      return;
    }
    // update view registry
    e.touchableViews.forEach(touchableView => {
      const view = this.viewRegistry.getViewByTag(touchableView.tag)
      if (view) {
        if (!(view instanceof ViewCAPI)) {
          logger.error(`Expected ViewCAPI`)
          return
        }
        view.updateBoundingBox(touchableView)
      } else {
        this.viewRegistry.save(new ViewCAPI(touchableView))
      }
    })
    // relay touch
    touchHandler.handleTouch(e, e.touchableViews.map(({tag}) => this.viewRegistry.getViewByTag(tag)));
  }

  // -------------------------------------------------------------------------------------------------------------------

  public install() {
    this.viewRegistry = this.ctx.rnInstance.getArchitecture() === "ARK_TS" ? new ViewRegistryArkTS(this.ctx.descriptorRegistry) : new ViewRegistryCAPI()
    const scrollLocker = this.ctx.rnInstance.getArchitecture() === "ARK_TS" ? new RNOHScrollLockerArkTS(this.ctx.rnInstance) : new RNOHScrollLockerCAPI(this.ctx.rnInstance, this.logger);
    const rnGestureResponder =  this.ctx.rnInstance.getArchitecture() === "ARK_TS" ? new FakeRNGestureResponder() : new RNOHGestureResponder(this.ctx.rnInstance)
    this.gestureHandlerFactory = new GestureHandlerFactory(this.logger, scrollLocker, this.interactionManager, rnGestureResponder)
    return true
  }

  public createGestureHandler(
    handlerName: string,
    handlerTag: number,
    config: Readonly<Record<string, unknown>>
  ) {
    const logger = this.logger.cloneWithPrefix("createGestureHandler")
    if (!this.gestureHandlerFactory) {
      this.ctx.logger.error("Trying to create a gesture handler before creating gesture handler factory")
      return
    }
    logger.debug({ handlerName, handlerTag, config })
    const gestureHandler = this.gestureHandlerFactory.create(handlerName, handlerTag)
    this.gestureHandlerRegistry.addGestureHandler(gestureHandler)
    this.interactionManager.configureInteractions(gestureHandler, config);
    gestureHandler.updateGestureConfig(config)
  }

  public attachGestureHandler(
    handlerTag: number,
    viewTag: number,
    actionType: ActionType
  ) {
    const eventDispatcher = this.createEventDispatcher(actionType, viewTag)
    if (!eventDispatcher) {
      this.ctx.logger.error("RNGH: Couldn't create EventDispatcher")
      return
    }
    const viewRegistry = this.viewRegistry
    let view = this.viewRegistry.getViewByTag(viewTag)
    if (!view && viewRegistry instanceof ViewRegistryCAPI) {
      view = new ViewCAPI({
        tag: viewTag,
        x: 0,
        y: 0,
        width: 0,
        height: 0
      })
      viewRegistry.save(view)
    }
    if (!view) {
      this.ctx.logger.error("Expected view")
      return;
    }
    this.gestureHandlerRegistry.bindGestureHandlerWithView(handlerTag, view)
    this.gestureHandlerRegistry
      .getGestureHandlerByHandlerTag(handlerTag)
      .setEventDispatcher(eventDispatcher)
  }

  private createEventDispatcher(actionType: ActionType, viewTag: number): OutgoingEventDispatcher | null {
    switch (actionType) {
      case ActionType.REANIMATED_WORKLET:
        return new ReanimatedEventDispatcher(this.ctx.rnInstance, this.logger.cloneWithPrefix('ReanimatedEventDispatcher'), viewTag)
      case ActionType.NATIVE_ANIMATED_EVENT:
        return new AnimatedEventDispatcher(this.ctx.rnInstance, this.logger.cloneWithPrefix('AnimatedEventDispatcher'), viewTag)
      case ActionType.JS_FUNCTION_OLD_API:
      case ActionType.JS_FUNCTION_NEW_API:
        return new JSEventDispatcher(this.ctx.rnInstance, this.logger.cloneWithPrefix('JSEventDispatcher'));
    }
  }

  public updateGestureHandler(
    handlerTag: number,
    newConfig: Readonly<Record<string, unknown>>
  ) {
    const gestureHandler = this.gestureHandlerRegistry.getGestureHandlerByHandlerTag(handlerTag)
    this.interactionManager.configureInteractions(gestureHandler, newConfig);
    gestureHandler.updateGestureConfig(newConfig)
  }

  public dropGestureHandler(handlerTag: number) {
    this.warn("dropGestureHandler is not implemented")
  }

  public handleSetJSResponder(tag: number, blockNativeResponder: boolean) {
    this.warn("handleSetJSResponder is not implemented")
  }

  public handleClearJSResponder() {
    this.warn("handleClearJSResponder is not implemented")
  }

  public flushOperations() {
    this.warn("flushOperations is not implemented")
  }

  // -------------------------------------------------------------------------------------------------------------------
  protected warn(message: string) {
    this.ctx.logger.warn("RNGH: " + message)
  }

  public getGestureHandlerRegistry() {
    return this.gestureHandlerRegistry
  }

  public getLogger() {
    return this.logger
  }

  public getViewRegistry() {
    if (!this.viewRegistry) {
      this.logger.info("Tried to get viewRegistry before it was initialized")
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