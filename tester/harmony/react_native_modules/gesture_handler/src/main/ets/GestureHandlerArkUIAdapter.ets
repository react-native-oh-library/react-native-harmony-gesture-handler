import { GestureHandler, View } from "./GestureHandler"
import { AdaptedEvent, EventType, PointerType, TouchEventType } from "./Event"

export class GestureHandlerArkUIAdapter {
  private activePointersCounter = 0

  constructor(private gestureHandler: GestureHandler, private view: View) {
  }

  handleTouch(e: TouchEvent) {
    for (const changedTouch of e.changedTouches) {
      const adaptedEvent = this.adaptTouchEvent(e, changedTouch)
      this.gestureHandler.onPointerDown(adaptedEvent)
    }

  }

  private adaptTouchEvent(e: TouchEvent, changedTouch: TouchObject): AdaptedEvent {
    const eventType = this.mapTouchTypeToEventType(changedTouch.type, this.activePointersCounter)
    this.activePointersCounter = this.getNewActivePointersCounter(changedTouch.type)

    return {
      x: changedTouch.x,
      y: changedTouch.y,
      offsetX: changedTouch.x - this.view.getBoundingRect().x,
      offsetY: changedTouch.y - this.view.getBoundingRect().y,
      pointerId: changedTouch.id,
      eventType: eventType,
      pointerType: PointerType.TOUCH,
      buttons: 0,
      time: e.timestamp,
      allTouches: [],
      changedTouches: [],
      touchEventType: this.mapTouchTypeToTouchEventType(changedTouch.type)
    }
  }

  private getNewActivePointersCounter(touchType: TouchType) {
    switch(touchType) {
      case TouchType.Down:
        return this.activePointersCounter + 1
      case TouchType.Up:
        return this.activePointersCounter - 1
      case TouchType.Cancel:
        return 0
    }
  }

  private mapTouchTypeToEventType(touchType: TouchType, activePointersCounter: number): EventType {
    switch(touchType) {
      case TouchType.Down:
        if (activePointersCounter > 0)
          return EventType.ADDITIONAL_POINTER_DOWN
        else
          return EventType.DOWN
      case TouchType.Up:
        if (activePointersCounter > 1)
          return EventType.ADDITIONAL_POINTER_UP
        else
          return EventType.UP
      case TouchType.Move:
        return EventType.MOVE
      case TouchType.Cancel:
        return EventType.CANCEL
      default:
        console.error("RNGH", "Unknown touchType")
    }
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