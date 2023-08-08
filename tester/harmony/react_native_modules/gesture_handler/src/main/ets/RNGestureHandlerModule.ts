import { TurboModule } from 'rnoh/ts';
import { GestureHandlerRegistry } from './GestureHandlerRegistry';

export class RNGestureHandlerModule extends TurboModule {
  static NAME = "RNGestureHandlerModule"

  private gestureHandlerRegistry = new GestureHandlerRegistry()

  handleSetJSResponder(tag: number, blockNativeResponder: boolean) {
  }

  handleClearJSResponder() {
  }

  createGestureHandler(
    handlerName: string,
    handlerTag: number,
    config: Readonly<Record<string, unknown>>
  ) {
  }

  attachGestureHandler(
    handlerTag: number,
    newView: number,
    actionType: 1 | 2 | 3 | 4
  ) {
  }

  updateGestureHandler(
    handlerTag: number,
    newConfig: Readonly<Record<string, unknown>>
  ) {
  }

  dropGestureHandler(handlerTag: number) {
  }

  install() {
    console.log("RNOH::install")
  }

  flushOperations() {
  }

  // -------------------------------------------------------------------------------------------------------------------

  public getGestureHandlerRegistry() {
    return this.gestureHandlerRegistry
  }
}
