import { DescriptorRegistry } from "rnoh"
import { GestureHandlerRegistry } from "./GestureHandlerRegistry"
import { GestureHandlerArkUIAdapter } from "./GestureHandlerArkUIAdapter"
import { ViewRegistry } from "./ViewRegistry"
import { RNGHLogger } from './RNGHLogger'

export class RNGHRootTouchHandler {
  static from(descriptorRegistry: DescriptorRegistry, gestureHandlerRegistry: GestureHandlerRegistry, logger: RNGHLogger) {
    return new RNGHRootTouchHandler(new ViewRegistry(descriptorRegistry), gestureHandlerRegistry, logger)
  }

  private adapterByViewTag: Map<number, GestureHandlerArkUIAdapter> = new Map() // TODO: remove an adapter when a view or gesture handler is removed

  constructor(private viewRegistry: ViewRegistry, private gestureHandlerRegistry: GestureHandlerRegistry, private logger: RNGHLogger) {
  }

  public handleTouch(e: TouchEvent) {
    for (const changedTouch of e.changedTouches) {
      const views = this.viewRegistry.getTouchableViewsAt(changedTouch)
      for (const view of views) {
        for (const handler of this.gestureHandlerRegistry.getGestureHandlersByViewTag(view.getTag())) {
          if (!this.adapterByViewTag.has(view.getTag()))
            this.adapterByViewTag.set(view.getTag(), new GestureHandlerArkUIAdapter(handler, view, this.logger.cloneWithPrefix("ArkUIAdapter")))
          this.adapterByViewTag.get(view.getTag()).handleTouch(e)
        }
      }
    }
  }
}