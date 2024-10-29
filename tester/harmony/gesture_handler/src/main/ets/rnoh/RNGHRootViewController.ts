import { TouchEvent as TouchEventArkTS, TouchType, TouchObject } from './types';
import { RNGHLogger, View, Multiset, GestureHandlerRegistry } from '../core';
import { RawTouchableView } from "./RNGHView"
import { RNGHViewController } from './RNGHViewController';

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
  /** TouchableViews is a list of views from the root to the leaf which contain within their boundaries the touch point specified by `actionTouch`. */
  touchableViews: RawTouchableView[]
};


const areRawTouchPointsEqual = (a: RawTouchPoint, b: RawTouchPoint) =>
a.pointerId === b.pointerId &&
  a.windowX === b.windowX &&
  a.windowY === b.windowY;


export class RNGHRootViewController {
  private logger: RNGHLogger;
  // This multiset keeps track of touchable views that were detected
  // at the beginning of the gesture to ensure they aren't overridden
  // during move touch events, which could prevent the gesture handler
  // from updating its state correctly.
  private touchableViewsMultiset: Multiset<View> = new Multiset();
  private viewControllerByViewTag: Map<number, RNGHViewController> =
    new Map(); // TODO: remove entry when view is removed
  /**
   * A view is ACTIVE, if it recently received POINTER_DOWN event
   */
  private activeViewTags = new Set<number>();

  constructor(
    logger: RNGHLogger,
    private gestureHandlerRegistry: GestureHandlerRegistry
  ) {
    this.logger = logger.cloneAndJoinPrefix('RNGHRootTouchHandlerCAPI');
  }

  handleTouch(rawTouchEvent: RawTouchEvent, touchableViews: View[]) {
    /**
     * NOTE: TouchEventArkTS was used in ArkTS RNOH architecture. Currently only C-API architecture is supported.
     */
    const touchEvent = rawTouchEventToTouchEventArkTS(rawTouchEvent);
    if (touchEvent.type === TouchType.Down) {
      touchableViews.forEach(view => this.touchableViewsMultiset.add(view));
    }
    const e = touchEvent;
    if (e.type === TouchType.Down) {
      this.activeViewTags.clear();
    }
    const views = touchableViews
    for (const view of views) {
      for (const handler of this.gestureHandlerRegistry.getGestureHandlersByViewTag(
        view.getTag(),
      )) {
        this.logger.info(
          `Found GestureHandler ${handler.getTag()} for view ${view.getTag()}`,
        );

        // create view touch handler if necessary
        if (!this.viewControllerByViewTag.has(view.getTag())) {
          this.viewControllerByViewTag.set(
            view.getTag(),
            new RNGHViewController(
              view,
              this.logger,
            ),
          );
        }

        // attach handler (there might be multiple handlers per view)
        this.viewControllerByViewTag.get(view.getTag())!.attachGestureHandler(handler) // TODO: detachGestureHandler

        // register active view tag
        if (e.type === TouchType.Down) {
          this.activeViewTags.add(view.getTag());
        }
      }
    }

    // send touch to gesture handlers, prioritize handling touch events for child components
    if (this.activeViewTags.size > 0) {
      const tags = Array.from(this.activeViewTags);
      for (let i = tags.length - 1; i >= 0; i--) {
        const tag = tags[i];
        const viewController = this.viewControllerByViewTag.get(tag);
        if (viewController) {
          viewController.handleTouch(e);
        }
      }
    }


    if (touchEvent.type === TouchType.Up || touchEvent.type === TouchType.Cancel) {
      touchableViews.forEach(view => this.touchableViewsMultiset.remove(view));
    }
  }

  cancelTouches() {
    for (const activeViewTag of this.activeViewTags) {
      this.gestureHandlerRegistry.getGestureHandlersByViewTag(activeViewTag).forEach(gh => {
        gh.cancel()
        gh.reset()
      })
    }
  }
}


const CACHED_RAW_TOUCH_POINT_BY_POINTER_ID = new Map<number, RawTouchPoint>();
let LAST_CHANGED_POINTER_ID: number | null = null;
const MAX_CACHE_SIZE = 10;

function rawTouchEventToTouchEventArkTS(raw: RawTouchEvent): TouchEventArkTS {
  const touchType = touchTypeFromAction(raw.action);
  const actionTouch = raw.actionTouch;

  let lastChangedTouch: RawTouchPoint = actionTouch;
  if (CACHED_RAW_TOUCH_POINT_BY_POINTER_ID.has(actionTouch.pointerId)) {
    if (!areRawTouchPointsEqual(actionTouch,
      CACHED_RAW_TOUCH_POINT_BY_POINTER_ID.get(actionTouch.pointerId) as RawTouchPoint)) {
      LAST_CHANGED_POINTER_ID = actionTouch.pointerId;
      CACHED_RAW_TOUCH_POINT_BY_POINTER_ID.set(actionTouch.pointerId, actionTouch);
    }
  } else {
    // remove first element if the cache is full
    if (CACHED_RAW_TOUCH_POINT_BY_POINTER_ID.size >= MAX_CACHE_SIZE) {
      CACHED_RAW_TOUCH_POINT_BY_POINTER_ID.delete(CACHED_RAW_TOUCH_POINT_BY_POINTER_ID.keys().next().value);
    }
    LAST_CHANGED_POINTER_ID = actionTouch.pointerId;
    CACHED_RAW_TOUCH_POINT_BY_POINTER_ID.set(actionTouch.pointerId, actionTouch);
  }
  lastChangedTouch = CACHED_RAW_TOUCH_POINT_BY_POINTER_ID.get(LAST_CHANGED_POINTER_ID as number) as RawTouchPoint
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