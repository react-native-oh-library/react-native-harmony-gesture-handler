import { GestureHandler } from "./GestureHandler"
import { EventType, PointerType, TouchEventType } from "./Event"

export class GestureHandlerArkUIAdapter {
  constructor(private gestureHandler: GestureHandler) {
  }

  handleTouch(e: TouchEvent) {
    this.gestureHandler.onPointerDown({
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      pointerId: 1,
      eventType: EventType.DOWN,
      pointerType: PointerType.TOUCH,
      buttons: 0,
      time: 0,
      allTouches: [],
      changedTouches: [],
      touchEventType: this.mapTouchTypeToTouchEventType(e.type)
    })
  }

  private mapTouchTypeToTouchEventType(touchType: TouchType): TouchEventType {
    switch(touchType) {
      case TouchType.Down:
        return TouchEventType.DOWN
      case TouchType.Up:
        return TouchEventType.UP
      case TouchType.Move:
        return TouchEventType.MOVE
      case TouchType.Cancel:
        return TouchEventType.CANCELLED
      default:
        return TouchEventType.UNDETERMINED
    }
  }
}