import { DescriptorRegistry, ViewBaseDescriptor } from "rnoh"
import { View, GestureHandler, BoundingBox } from "./GestureHandler"
import { GestureHandlerArkUIAdapter } from "./GestureHandlerArkUIAdapter"

export interface ViewRegistry {
  getTouchableViewsAt(pos: {
    x: number,
    y: number
  }): View[]
}

export class ViewImpl implements View {
  constructor(private descriptorRegistry: DescriptorRegistry, private viewTag: number) {
  }

  public getChildren() {
    return this.getDescriptor().childrenTags.map(childrenTag => {
      return new ViewImpl(this.descriptorRegistry, childrenTag)
    })
  }

  public getTag() {
    return this.viewTag
  }

  public isInBounds({x, y}: {x: number, y: number}): boolean {
    const rect = this.getBoundingRect()
    return x >= rect.x && x <= (rect.x + rect.width) && y >= rect.y && y <= (rect.y + rect.height);
  }

  public getBoundingRect(): BoundingBox {
    const d = this.getDescriptor()
    return {
      x: d.layoutMetrics.frame.origin.x,
      y: d.layoutMetrics.frame.origin.y,
      width: d.layoutMetrics.frame.size.width,
      height: d.layoutMetrics.frame.size.height
    }
  }

  private getDescriptor() {
    return this.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(this.viewTag)
  }
}

export class ViewRegistryAdapter implements ViewRegistry {
  constructor(private descriptorRegistry: DescriptorRegistry) {
  }

  getTouchableViewsAt(pos: {
    x: number,
    y: number
  }) {
    // TODO
    return []
  }

  getRootViews(): View[] {
    const rootTag = 1; // TODO: remove hardcoded rootTag with a loop that iterates over root descriptors
    return [new ViewImpl(this.descriptorRegistry, rootTag)]
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