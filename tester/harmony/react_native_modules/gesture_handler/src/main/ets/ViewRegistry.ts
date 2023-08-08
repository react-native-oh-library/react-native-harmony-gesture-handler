import { DescriptorRegistry } from "rnoh/ts"
import { View } from "./View"

export class ViewRegistry {
  constructor(private descriptorRegistry: DescriptorRegistry) {
  }

  public getViewByTag(viewTag: number) {
    return new View(this.descriptorRegistry, viewTag)
  }

  public getTouchableViewsAt(pos: {
    x: number,
    y: number
  }) {
    const results: View[] = []
    for (const rootView of this.getRootViews()) {
      for (const view of this.getTouchableViewsAtPosInView(pos, rootView)) {
        results.push(view)
      }
    }
    return results
  }

  private getRootViews(): View[] {
    const rootTag = 1; // TODO: remove hardcoded rootTag with a loop that iterates over root descriptors
    return [new View(this.descriptorRegistry, rootTag)]
  }

  private getTouchableViewsAtPosInView(pos: {
    x: number,
    y: number
  }, view: View) {
    if (!view.isPositionInBounds(pos))
      return [];

    const results: View[] = []
    results.push(view)
    for (const child of view.getChildren()) {
      for (const result of this.getTouchableViewsAtPosInView(pos, child)) {
        results.push(result)
      }
    }
    return results
  }
}