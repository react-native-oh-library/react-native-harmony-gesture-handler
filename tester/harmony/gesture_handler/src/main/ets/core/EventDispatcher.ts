import {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  GestureTouchEvent,
} from './OutgoingEvent';

export interface EventDispatcher {
  onGestureHandlerStateChange(event: GestureStateChangeEvent): void;
  onGestureHandlerEvent(
    event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent,
  ): void;
}
