import { ComponentManagerRegistry, RNViewManager, DescriptorRegistry, Descriptor } from "rnoh/ts"
import { Vector2D } from './Vector2D'

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
    const scrollOffset = this.getTotalScrollOffset()
    return { x: left - scrollOffset.x, y: top - scrollOffset.y, width: right - left, height: bottom - top }
  }

  private getDescriptor() {
    return this.descriptorRegistry.getDescriptor(this.viewTag)
  }

  private getTotalScrollOffset(): Vector2D {
    const currentOffset = new Vector2D()
    let parentTag = this.getDescriptor().parentTag
    while (parentTag !== undefined) {
      const d = this.descriptorRegistry.getDescriptor(parentTag)
      currentOffset.add(this.extractScrollOffsetFromDescriptor(d))
      parentTag = d.parentTag
    }
    return currentOffset

  }

  private extractScrollOffsetFromDescriptor(descriptor: Descriptor<any>) {
    if (descriptor.type !== "ScrollView")
      return new Vector2D();
    const scrollViewState: any = descriptor.state;
    return new Vector2D({ x: scrollViewState.contentOffsetX, y: scrollViewState.contentOffsetY })
  }
}