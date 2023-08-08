import { TurboModule } from 'rnoh/ts';
import { GestureHandlerRegistry } from './GestureHandlerRegistry';
import { GestureHandlerFactory } from "./GestureHandlerFactory"
import { GestureHandlerOrchestrator } from './GestureHandlerOrchestrator';
import { ViewRegistry } from './ViewRegistry';

export enum ActionType {
  REANIMATED_WORKLET = 1,
  NATIVE_ANIMATED_EVENT = 2,
  JS_FUNCTION_OLD_API = 3,
  JS_FUNCTION_NEW_API = 4,
}
;

export class RNGestureHandlerModule extends TurboModule {
  static NAME = "RNGestureHandlerModule"

  private gestureHandlerRegistry = new GestureHandlerRegistry()
  private gestureHandlerFactory: GestureHandlerFactory | undefined = undefined
  private viewRegistry: ViewRegistry | undefined = undefined

  install() {
    const orchestrator = new GestureHandlerOrchestrator()
    this.viewRegistry = new ViewRegistry(this.ctx.descriptorRegistry)
    this.gestureHandlerFactory = new GestureHandlerFactory(orchestrator)
  }

  createGestureHandler(
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
  }

  attachGestureHandler(
    handlerTag: number,
    newView: number,
    actionType: ActionType
  ) {
    switch (actionType) {
      case ActionType.REANIMATED_WORKLET:
        this.ctx.logger.error("RNGH: Reanimated Worklets are not supported")
        break;
      case ActionType.NATIVE_ANIMATED_EVENT:
        this.ctx.logger.error("RNGH: Native animated events are not supported")
        break;
      case ActionType.JS_FUNCTION_OLD_API:
      case ActionType.JS_FUNCTION_NEW_API:
        const view = this.viewRegistry.getViewByTag(newView)
        this.gestureHandlerRegistry.bindGestureHandlerWithView(handlerTag, view)
        break;
    }
  }

  updateGestureHandler(
    handlerTag: number,
    newConfig: Readonly<Record<string, unknown>>
  ) {
  }

  dropGestureHandler(handlerTag: number) {
  }

  handleSetJSResponder(tag: number, blockNativeResponder: boolean) {
  }

  handleClearJSResponder() {
  }

  flushOperations() {
  }

  // -------------------------------------------------------------------------------------------------------------------

  public getGestureHandlerRegistry() {
    return this.gestureHandlerRegistry
  }
}
