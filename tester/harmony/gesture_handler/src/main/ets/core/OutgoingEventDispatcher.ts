import {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  GestureTouchEvent,
} from './OutgoingEvent';

export interface OutgoingEventDispatcher {
  onGestureHandlerStateChange(event: GestureStateChangeEvent): void;
  onGestureHandlerEvent(
    event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent,
  ): void;
}
