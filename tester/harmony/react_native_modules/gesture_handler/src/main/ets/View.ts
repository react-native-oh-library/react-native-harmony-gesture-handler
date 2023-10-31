import { ComponentManagerRegistry, RNViewManager, DescriptorRegistry } from "rnoh/ts"

export type BoundingBox = {
  x: number,
  y: number,
  width: number,
  height: number
}

export class View {
  constructor(private componentManagerRegistry: ComponentManagerRegistry,
              private viewManager: RNViewManager,
              private descriptorRegistry: DescriptorRegistry,
              private viewTag: number) {
  }

  public getChildren() {
    return this.getDescriptor().childrenTags.map(childrenTag => {
      return new View(this.componentManagerRegistry, this.viewManager, this.descriptorRegistry, childrenTag)
    })
  }

  public getTag() {
    return this.viewTag
  }

  public isPositionInBounds(point: {
    x: number,
    y: number
  }): boolean {
    return this.viewManager.isPointInView(point)
  }

  public getBoundingRect(): BoundingBox {
    const { top, left, right, bottom } = this.viewManager.getBoundingBox()
    return { x: left, y: top, width: right - left, height: bottom - top }
  }

  private getDescriptor() {
    return this.descriptorRegistry.getDescriptor(this.viewTag)
  }
}