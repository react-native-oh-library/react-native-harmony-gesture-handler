import { TurboModule, TurboModuleContext, Tag } from "@rnoh/react-native-openharmony/ts";
import { TM } from "@rnoh/react-native-openharmony/generated/ts"
import { GestureHandlerRegistry } from './GestureHandlerRegistry';
import { GestureHandlerFactory } from "./GestureHandlerFactory"
import { ViewRegistry } from './ViewRegistry';
import { RNGHLogger, StandardRNGHLogger, FakeRNGHLogger } from './RNGHLogger';
import {
  EventDispatcher,
  JSEventDispatcher,
  AnimatedEventDispatcher,
  ReanimatedEventDispatcher
} from './EventDispatcher'
import { RNOHScrollLockerArkTS, RNOHScrollLockerCAPI } from "./RNOHScrollLocker"
import { State } from './State';
import { RNGHRootTouchHandlerCAPI, RawTouchEvent } from "./RNGHRootTouchHandlerCAPI"
import { RNGHRootTouchHandlerArkTS } from './RNGHRootTouchHandlerArkTS';

export enum ActionType {
  REANIMATED_WORKLET = 1,
  NATIVE_ANIMATED_EVENT = 2,
  JS_FUNCTION_OLD_API = 3,
  JS_FUNCTION_NEW_API = 4,
}


export class RNGestureHandlerModule extends TurboModule implements TM.RNGestureHandlerModule.Spec {
  static NAME = "RNGestureHandlerModule"

  private gestureHandlerRegistry = new GestureHandlerRegistry()
  private gestureHandlerFactory: GestureHandlerFactory | undefined = undefined
  private viewRegistry: ViewRegistry | undefined = undefined
  private logger: RNGHLogger
  private touchHandlerByRootTag = new Map<Tag, RNGHRootTouchHandlerCAPI>()

  constructor(ctx: TurboModuleContext) {
    super(ctx)
    const debug = false
    this.logger = debug ? new StandardRNGHLogger(ctx.logger, "RNGH") : new FakeRNGHLogger()
    if (this.ctx.rnInstance.getArchitecture() === "C_API") {
      this.ctx.rnInstance.cppEventEmitter.subscribe("RNGH::TOUCH_EVENT", (e: any) => {
        this.onTouch(e)
      })
      this.ctx.rnInstance.cppEventEmitter.subscribe("RNGH::ROOT_CREATED", (rootTag: any) => {
        this.onGHRootCreated(rootTag)
      })
    }
  }

  private onGHRootCreated(rootTag: Tag) {
    this.touchHandlerByRootTag.set(rootTag, new RNGHRootTouchHandlerCAPI(this.logger, new RNGHRootTouchHandlerArkTS(rootTag, this.viewRegistry, this.gestureHandlerRegistry, this.logger)));
  }

  private onTouch(e: RawTouchEvent & { rootTag: Tag }) {
    const touchHandler = this.touchHandlerByRootTag.get(e.rootTag)
    if (touchHandler) {
      touchHandler.handleTouch(e);
    } else {
      this.logger.info(`Couldn't find touch handler for root tag: ${e.rootTag}`)
    }

  }

  public install() {
    this.viewRegistry = new ViewRegistry(this.ctx.descriptorRegistry, this.ctx.componentManagerRegistry)
    const scrollLocker = this.ctx.rnInstance.getArchitecture() === "ARK_TS" ? new RNOHScrollLockerArkTS(this.ctx.rnInstance) : new RNOHScrollLockerCAPI(this.ctx.rnInstance);
    this.gestureHandlerFactory = new GestureHandlerFactory(this.logger, scrollLocker)
    return true
  }

  public createGestureHandler(
    handlerName: string,
    handlerTag: number,
    config: Readonly<Record<string, unknown>>
  ) {
    if (!this.gestureHandlerFactory) {
      this.ctx.logger.error("Trying to create a gesture handler before creating gesture handler factory")
      return
    }
    const gestureHandler = this.gestureHandlerFactory.create(handlerName, handlerTag)
    this.gestureHandlerRegistry.addGestureHandler(gestureHandler)
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
    const view = this.viewRegistry.getViewByTag(viewTag)
    if (!view) {
      this.ctx.logger.error(`RNGH: Couldn't attachGestureHandler to view ${viewTag}`)
      return;
    }
    this.gestureHandlerRegistry.bindGestureHandlerWithView(handlerTag, view)
    this.gestureHandlerRegistry
      .getGestureHandlerByHandlerTag(handlerTag)
      .setEventDispatcher(eventDispatcher)
  }

  private createEventDispatcher(actionType: ActionType, viewTag: number): EventDispatcher | null {
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
