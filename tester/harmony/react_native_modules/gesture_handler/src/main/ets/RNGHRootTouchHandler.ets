import { DescriptorRegistry } from "rnoh"
import { GestureHandler } from "./GestureHandler"
import { GestureHandlerArkUIAdapter } from "./GestureHandlerArkUIAdapter"
import { ViewRegistry } from "./ViewRegistry"

export class GestureHandlerRegistry {
  public getGestureHandlersByViewTag(viewTag: number): GestureHandler[] {
    return []
  }
}

export class RNGHRootTouchHandler {
  static fromDescriptorRegistry(descriptorRegistry: DescriptorRegistry) {
    return new RNGHRootTouchHandler(new ViewRegistry(descriptorRegistry), new GestureHandlerRegistry())
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