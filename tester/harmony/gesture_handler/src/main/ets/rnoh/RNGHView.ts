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

  isPositionInBounds({ x, y }: {
    x: number;
    y: number
  }): boolean {
    const rect = this.getBoundingRect();
    return (
      x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    );
  }

  updateBoundingBox(boundingBox: BoundingBox) {
    this.boundingBox = boundingBox
  }

  setButtonRole(buttonRole: boolean) {
    this.buttonRole = buttonRole
  }

  hasButtonRole(): boolean {
    return this.buttonRole
  }
}
