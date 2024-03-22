import { RNGHRootTouchHandlerArkTS } from "./RNGHRootTouchHandlerArkTS"
import { TouchEvent as TouchEventArkTS, TouchType, TouchObject } from "./types"
import { RNGHLogger } from "./RNGHLogger"

type RawTouchPoint = {
  contactAreaHeight: number
  contactAreaWidth: number
  id: number
  nodeX: number
  nodeY: number
  pressedTime: number
  pressure: number
  rawX: number
  rawY: number
  screenX: number
  screenY: number
  tiltX: number
  tiltY: number
  toolHeight: number
  toolType: number
  toolWidth: number
  toolX: number
  toolY: number
  windowX: number
  windowY: number
}

export type RawTouchEvent = {
  action: number,
  actionTouch: RawTouchPoint,
  touchPoints: RawTouchPoint[],
  sourceType: number,
  timestamp: number
}

class TouchEvent {
  constructor(private raw: RawTouchEvent) {
  }

  asTouchEventArkTS(): TouchEventArkTS {
    const touchType = this.touchTypeFromAction(this.raw.action)
    return {
      type: this.touchTypeFromAction(this.raw.action),
      touches: this.raw.touchPoints.map(tp => this.touchObjectFromTouchPoint(tp, touchType)),
      changedTouches: [this.touchObjectFromTouchPoint(this.raw.actionTouch, touchType)],
      timestamp: this.raw.timestamp
    }
  }

  private touchTypeFromAction(action: number): TouchType {
    switch (action) {
      case 1:
        return TouchType.Down
      case 2:
        return TouchType.Move
      case 3:
        return TouchType.Up
      default:
        return TouchType.Cancel
    }
  }

  private touchObjectFromTouchPoint(touchPoint: RawTouchPoint, touchType: TouchType): TouchObject {
    return {
      id: touchPoint.id,
      windowX: touchPoint.windowX,
      windowY: touchPoint.windowY,
      x: touchPoint.windowX,
      y: touchPoint.windowY,
      type: touchType
    }
  }
}

export class RNGHRootTouchHandlerCAPI {
  private logger: RNGHLogger

  constructor(logger: RNGHLogger, private touchHandlerArkTS: RNGHRootTouchHandlerArkTS) {
    this.logger = logger.cloneWithPrefix("RNGHRootTouchHandlerCAPI")
  }

  handleTouch(rawTouchEvent: RawTouchEvent) {
    this.logger.cloneWithPrefix("handleTouch").debug(JSON.stringify(rawTouchEvent))
    this.touchHandlerArkTS.handleTouch(new TouchEvent(rawTouchEvent).asTouchEventArkTS())
  }
}

