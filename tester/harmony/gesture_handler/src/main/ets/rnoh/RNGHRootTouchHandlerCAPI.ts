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

const CACHED_TOUCHES_MAP = new Map<number, RawTouchPoint>();
let lastChangedPointerId: number | null = null;
const MAX_SIZE = 10;
const areRawTouchPointsEqual = (a: RawTouchPoint, b: RawTouchPoint) =>
  a.pointerId === b.pointerId &&
  a.windowX === b.windowX &&
  a.windowY === b.windowY;


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

  cancelTouches() {
    this.touchHandlerArkTS.cancelTouches()
  }
}

function touchEventArkTSFromRawTouchEvent(raw: RawTouchEvent): TouchEventArkTS {
  const touchType = touchTypeFromAction(raw.action);
  const actionTouch = raw.actionTouch;
  let hasTouchChanged = true;
  let lastChangedTouch: RawTouchPoint = actionTouch;
  if (CACHED_TOUCHES_MAP.has(actionTouch.pointerId)) {
    if (areRawTouchPointsEqual(actionTouch, CACHED_TOUCHES_MAP.get(actionTouch.pointerId) as RawTouchPoint)) {
      hasTouchChanged = false;
    } else {
      lastChangedPointerId = actionTouch.pointerId;
      CACHED_TOUCHES_MAP.set(actionTouch.pointerId, actionTouch);
    }
  } else {
    // remove first element if the cache is full
    if (CACHED_TOUCHES_MAP.size >= MAX_SIZE) {
      CACHED_TOUCHES_MAP.delete(CACHED_TOUCHES_MAP.keys().next().value);
    }
    lastChangedPointerId = actionTouch.pointerId;
    CACHED_TOUCHES_MAP.set(actionTouch.pointerId, actionTouch);
  }
  lastChangedTouch = CACHED_TOUCHES_MAP.get(lastChangedPointerId as number) as RawTouchPoint
  return {
    type: touchTypeFromAction(raw.action),
    touches: raw.touchPoints.map(tp =>
    touchObjectFromTouchPoint(tp, touchType),
    ),
    changedTouches: [
      touchObjectFromTouchPoint(lastChangedTouch, touchType),
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