import { RNGHRootTouchHandlerArkTS } from './RNGHRootTouchHandlerArkTS';
import { TouchEvent as TouchEventArkTS, TouchType, TouchObject } from './types';
import { RNGHLogger, View } from '../core';
import { RawTouchableView } from "./View"

type RawTouchPoint = {
  pointerId: number;
  windowX: number;
  windowY: number;
};

export type RawTouchEvent = {
  action: number;
  actionTouch: RawTouchPoint;
  touchPoints: RawTouchPoint[];
  sourceType: number;
  timestamp: number;
  /** TouchableViews is a list of views from root to leaf which contain the touch point specified by `actionTouch` in their boundary boxes. */
  touchableViews: RawTouchableView[]
};

export class RNGHRootTouchHandlerCAPI {
  private logger: RNGHLogger;

  constructor(
    logger: RNGHLogger,
    private touchHandlerArkTS: RNGHRootTouchHandlerArkTS,
  ) {
    this.logger = logger.cloneWithPrefix('RNGHRootTouchHandlerCAPI');
  }

  handleTouch(rawTouchEvent: RawTouchEvent, touchableViews: View[]) {
    this.touchHandlerArkTS.handleTouch(
      touchEventArkTSFromRawTouchEvent(rawTouchEvent), touchableViews
    );
  }
}

function touchEventArkTSFromRawTouchEvent(raw: RawTouchEvent): TouchEventArkTS {
  const touchType = touchTypeFromAction(raw.action);
  return {
    type: touchTypeFromAction(raw.action),
    touches: raw.touchPoints.map(tp =>
    touchObjectFromTouchPoint(tp, touchType),
    ),
    changedTouches: [
      touchObjectFromTouchPoint(raw.actionTouch, touchType),
    ],
    timestamp: raw.timestamp / Math.pow(10, 6),
  };
}

function touchTypeFromAction(action: number): TouchType {
  switch (action) {
    case 1:
      return TouchType.Down;
    case 2:
      return TouchType.Move;
    case 3:
      return TouchType.Up;
    default:
      return TouchType.Cancel;
  }
}

function touchObjectFromTouchPoint(
  touchPoint: RawTouchPoint,
  touchType: TouchType,
): TouchObject {
  return {
    id: touchPoint.pointerId,
    windowX: touchPoint.windowX,
    windowY: touchPoint.windowY,
    x: touchPoint.windowX,
    y: touchPoint.windowY,
    type: touchType,
  };
}