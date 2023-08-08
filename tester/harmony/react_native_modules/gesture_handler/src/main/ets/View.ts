import { DescriptorRegistry } from "rnoh/ts"

export type BoundingBox = {x: number, y: number, width: number, height: number}

export class View {
  constructor(private descriptorRegistry: DescriptorRegistry, private viewTag: number) {
  }

  public getChildren() {
    return this.getDescriptor().childrenTags.map(childrenTag => {
      return new View(this.descriptorRegistry, childrenTag)
    })
  }

  public getTag() {
    return this.viewTag
  }

  public isPositionInBounds({x, y}: {
    x: number,
    y: number
  }): boolean {
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
    return this.descriptorRegistry.getDescriptor(this.viewTag)
  }
}