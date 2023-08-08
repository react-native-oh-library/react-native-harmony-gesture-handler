import { DescriptorRegistry } from "rnoh"
import { GestureHandlerRegistry } from "./GestureHandlerRegistry"
import { GestureHandlerArkUIAdapter } from "./GestureHandlerArkUIAdapter"
import { ViewRegistry } from "./ViewRegistry"

export class RNGHRootTouchHandler {
  static from(descriptorRegistry: DescriptorRegistry, gestureHandlerRegistry: GestureHandlerRegistry) {
    return new RNGHRootTouchHandler(new ViewRegistry(descriptorRegistry), gestureHandlerRegistry)
  }

  constructor(private viewRegistry: ViewRegistry, private gestureHandlerRegistry: GestureHandlerRegistry) {
  }

  public handleTouch(e: TouchEvent) {
    for (const changedTouch of e.changedTouches) {
      const views = this.viewRegistry.getTouchableViewsAt(changedTouch)
      for (const view of views) {
        for (const handler of this.gestureHandlerRegistry.getGestureHandlersByViewTag(view.getTag())) {
          new GestureHandlerArkUIAdapter(handler, view).handleTouch(e)
        }
      }
    }
  }
}