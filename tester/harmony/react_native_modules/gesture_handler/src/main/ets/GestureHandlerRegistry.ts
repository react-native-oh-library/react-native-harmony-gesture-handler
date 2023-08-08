import { GestureHandler } from "./GestureHandler"

export class GestureHandlerRegistry {
  private gestureHandlerByHandlerTag: Map<number, GestureHandler> = new Map()
  private gestureHandlersByViewTag: Map<number, Set<GestureHandler>> = new Map()

  public addGestureHandler(gestureHandler: GestureHandler) {
    this.gestureHandlerByHandlerTag.set(gestureHandler.getTag(), gestureHandler)
  }

  public bindGestureHandlerWithView(gestureHandlerTag: number, viewTag: number) {
    if (!this.gestureHandlersByViewTag.has(viewTag))
      this.gestureHandlersByViewTag.set(viewTag, new Set())
    this.gestureHandlersByViewTag.get(viewTag).add(this.gestureHandlerByHandlerTag.get(gestureHandlerTag))
  }

  public getGestureHandlersByViewTag(viewTag: number): GestureHandler[] {
    return Array.from(this.gestureHandlersByViewTag.get(viewTag) ?? [])
  }
}