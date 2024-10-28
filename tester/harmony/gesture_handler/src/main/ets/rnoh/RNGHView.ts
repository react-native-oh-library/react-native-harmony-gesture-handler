import { View, BoundingBox } from "../core"


export type RawTouchableView = {
  tag: number,
  /**
   * Relative to application window.
   */
  x: number,
  /**
   * Relative to application window.
   */
  y: number,
  width: number,
  height: number,
  buttonRole: boolean,
}

export class RNGHView implements View {
  private tag: number
  private buttonRole: boolean
  private boundingBox: BoundingBox
  private childrenBoundingBoxes: Set<BoundingBox> = new Set()

  constructor({ tag, buttonRole, ...boundingBox }: RawTouchableView) {
    this.tag = tag
    this.buttonRole = buttonRole
    this.boundingBox = boundingBox
  }

  getTag(): number {
    return this.tag
  }

  getBoundingRect(): BoundingBox {
    return { ...this.boundingBox }
  }

  getChildrenBoundingRects(): BoundingBox[] {
    return Array.from(this.childrenBoundingBoxes)
  }

  isPositionInBounds({ x, y }: {
    x: number;
    y: number
  }): boolean {
    const rects = [this.boundingBox, ...this.childrenBoundingBoxes]
    return rects.some(rect => (
      x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    ))
  }

  updateBoundingBox(boundingBox: BoundingBox) {
    this.boundingBox = boundingBox
  }

  attachChildrenBoundingRects(view: RNGHView) {
    this.childrenBoundingBoxes.add(view.getBoundingRect())
    for (const childBoundingBox of view.getChildrenBoundingRects()) {
      this.childrenBoundingBoxes.add(childBoundingBox)
    }
  }

  intersectsWith(view: RNGHView): boolean {
    const rect1 = this.getBoundingRect()
    const rect2 = view.getBoundingRect()
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    )
  }

  setButtonRole(buttonRole: boolean) {
    this.buttonRole = buttonRole
  }

  hasButtonRole(): boolean {
    return this.buttonRole
  }
}
