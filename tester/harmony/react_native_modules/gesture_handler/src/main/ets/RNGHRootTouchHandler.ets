import { DescriptorRegistry } from "rnoh"
import { View, GestureHandler } from "./GestureHandler"
import { GestureHandlerArkUIAdapter } from "./GestureHandlerArkUIAdapter"

export interface ViewRegistry {
  getTouchableViewsAt(pos: {
    x: number,
    y: number
  }): View[]
}

export class ViewRegistryAdapter implements ViewRegistry {
  constructor(private descriptorRegistry) {}

  getTouchableViewsAt(pos: {x: number, y: number}) {
    // TODO
    return []
  }
}

export class GestureHandlerRegistry {
  public getGestureHandlersByViewTag(viewTag: number): GestureHandler[] {
    return []
  }
}

export class RNGHRootTouchHandler {
  static fromDescriptorRegistry(descriptorRegistry: DescriptorRegistry) {
    return new RNGHRootTouchHandler(new ViewRegistryAdapter(descriptorRegistry), new GestureHandlerRegistry())
  }

  constructor(private viewRegistry: ViewRegistry, private gestureHandlerRegistry: GestureHandlerRegistry) {}

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