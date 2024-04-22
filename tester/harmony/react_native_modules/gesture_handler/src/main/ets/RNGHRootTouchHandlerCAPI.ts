import { RNGHRootTouchHandlerArkTS } from "./RNGHRootTouchHandlerArkTS"
import { TouchEvent as TouchEventArkTS, TouchType, TouchObject } from "./types"
import { RNGHLogger } from "./RNGHLogger"

type RawTouchPoint = {
  pointerId: number
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
<<<<<<< HEAD
<<<<<<< HEAD
      case 1:
        return TouchType.Down
      case 2:
        return TouchType.Move
      case 3:
        return TouchType.Up
      default:
=======
      case 0:
        return TouchType.Down
=======
>>>>>>> 43d4b3b (chore: bump react-native-harmony)
      case 1:
        return TouchType.Down
      case 2:
        return TouchType.Move
      case 3:
<<<<<<< HEAD
>>>>>>> 5e7d7ff (feat: support C-API arch)
=======
        return TouchType.Up
      default:
>>>>>>> 43d4b3b (chore: bump react-native-harmony)
        return TouchType.Cancel
    }
  }

  private touchObjectFromTouchPoint(touchPoint: RawTouchPoint, touchType: TouchType): TouchObject {
    return {
      id: touchPoint.pointerId,
      windowX: touchPoint.windowX,
      windowY: touchPoint.windowY,
<<<<<<< HEAD
<<<<<<< HEAD
      x: touchPoint.windowX,
      y: touchPoint.windowY,
=======
      x: touchPoint.rawX,
      y: touchPoint.rawY,
>>>>>>> 5e7d7ff (feat: support C-API arch)
=======
      x: touchPoint.windowX,
      y: touchPoint.windowY,
>>>>>>> 43d4b3b (chore: bump react-native-harmony)
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
<<<<<<< HEAD
<<<<<<< HEAD
    this.logger.cloneWithPrefix("handleTouch").debug(JSON.stringify(rawTouchEvent))
=======
>>>>>>> 5e7d7ff (feat: support C-API arch)
=======
    this.logger.cloneWithPrefix("handleTouch").debug(JSON.stringify(rawTouchEvent))
>>>>>>> 43d4b3b (chore: bump react-native-harmony)
    this.touchHandlerArkTS.handleTouch(new TouchEvent(rawTouchEvent).asTouchEventArkTS())
  }
}

