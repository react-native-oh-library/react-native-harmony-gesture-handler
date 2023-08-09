import { GestureHandler } from "./GestureHandler"
import { AdaptedEvent, EventType, PointerType, TouchEventType, Touch } from "./Event"
import { View } from "./View"


export class GestureHandlerArkUIAdapter {
  private activePointersCounter = 0
  private pointersIdInBounds = new Set<number>()

  constructor(private gestureHandler: GestureHandler, private view: View) {
  }

  handleTouch(e: TouchEvent) {
    for (const changedTouch of e.changedTouches) {
      if (this.shouldSkipTouch(changedTouch)) continue;
      const wasInBounds = this.pointersIdInBounds.has(changedTouch.id)
      const isInBounds = this.isInBounds(changedTouch)
      const adaptedEvent = this.adaptTouchEvent(e, changedTouch)
      switch (adaptedEvent.eventType) {
        case EventType.DOWN:
          this.gestureHandler.onPointerDown(adaptedEvent)
          break;
        case EventType.ADDITIONAL_POINTER_DOWN:
          this.gestureHandler.onAdditionalPointerAdd(adaptedEvent)
          break;
        case EventType.UP:
          this.gestureHandler.onPointerUp(adaptedEvent)
          break;
        case EventType.ADDITIONAL_POINTER_UP:
          this.gestureHandler.onAdditionalPointerRemove(adaptedEvent)
          break;
        case EventType.MOVE:
          if (!wasInBounds && !isInBounds)
            this.gestureHandler.onPointerOutOfBounds(adaptedEvent)
          else
            this.gestureHandler.onPointerMove(adaptedEvent)
          break;
        case EventType.ENTER:
          this.gestureHandler.onPointerEnter(adaptedEvent)
          break;
        case EventType.OUT:
          this.gestureHandler.onPointerOut(adaptedEvent)
          break;
        case EventType.CANCEL:
          this.gestureHandler.onPointerCancel(adaptedEvent)
          break;
      }
    }
  }

  private shouldSkipTouch(changedTouch: TouchObject): boolean {
    return changedTouch.type === TouchType.Down && !this.isInBounds({ x: changedTouch.x, y: changedTouch.y })
  }

  private adaptTouchEvent(e: TouchEvent, changedTouch: TouchObject): AdaptedEvent {
    const eventType = this.mapTouchTypeToEventType({
      touchType: changedTouch.type,
      activePointersCounter: this.activePointersCounter,
      isCurrentlyInBounds: this.isInBounds({ x: changedTouch.x, y: changedTouch.y }),
      wasInBounds: this.pointersIdInBounds.has(changedTouch.id)
    })
    this.updateIsInBoundsByPointerId({
      touchType: changedTouch.type,
      pointerId: changedTouch.id,
      x: changedTouch.x,
      y: changedTouch.y
    })
    this.activePointersCounter = this.getUpdatedActivePointersCounter(changedTouch.type)
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
      allTouches: e.touches.map(this.mapTouchObjectToTouch.bind(this)),
      changedTouches: e.changedTouches.map(this.mapTouchObjectToTouch.bind(this)),
      touchEventType: this.mapTouchTypeToTouchEventType(changedTouch.type)
    }
  }

  private updateIsInBoundsByPointerId({touchType, pointerId, x, y}: {
    touchType: TouchType,
    pointerId: number,
    x: number,
    y: number
  }) {
    switch (touchType) {
      case TouchType.Down:
        if (this.isInBounds({ x, y }))
          this.pointersIdInBounds.add(pointerId)
        break;
      case TouchType.Move:
        if (this.isInBounds({ x, y }))
          this.pointersIdInBounds.add(pointerId)
        else
          this.pointersIdInBounds.delete(pointerId)
        break;
      case TouchType.Up:
        this.pointersIdInBounds.delete(pointerId)
        break;
      case TouchType.Cancel:
        this.pointersIdInBounds.delete(pointerId)
        break;
    }
  }

  private isInBounds({x, y}: {
    x: number,
    y: number
  }) {
    const rect = this.view.getBoundingRect()
    return x >= rect.x && x <= (rect.x + rect.width) && y >= rect.y && y <= (rect.y + rect.height);
  }

  private getUpdatedActivePointersCounter(touchType: TouchType) {
    switch (touchType) {
      case TouchType.Down:
        return this.activePointersCounter + 1
      case TouchType.Up:
        return this.activePointersCounter - 1
      case TouchType.Cancel:
        return 0
    }
  }

  private mapTouchObjectToTouch(touchObject: TouchObject): Touch {
    return {
      id: touchObject.id,
      x: touchObject.x,
      y: touchObject.y,
      absoluteX: touchObject.screenX,
      absoluteY: touchObject.screenY
    }
  }

  private mapTouchTypeToEventType({touchType, activePointersCounter, isCurrentlyInBounds, wasInBounds}: {
    touchType: TouchType,
    activePointersCounter: number,
    isCurrentlyInBounds: boolean,
    wasInBounds: boolean
  }): EventType {
    switch (touchType) {
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
        if (isCurrentlyInBounds) {
          return wasInBounds ? EventType.MOVE : EventType.ENTER
        } else {
          return wasInBounds ? EventType.OUT : EventType.MOVE
        }
      case TouchType.Cancel:
        return EventType.CANCEL
      default:
        console.error("RNGH", "Unknown touchType")
    }
  }

  private mapTouchTypeToTouchEventType(touchType: TouchType): TouchEventType {
    switch (touchType) {
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