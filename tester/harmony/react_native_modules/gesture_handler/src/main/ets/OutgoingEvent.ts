import { State } from "./State"


export interface GestureEventPayload {
  handlerTag: number;
  numberOfPointers: number;
  state: State;
}

export interface HandlerStateChangeEventPayload extends GestureEventPayload {
  oldState: State;
}

export type GestureUpdateEvent<GestureEventPayloadT = Record<string, unknown>> =
GestureEventPayload & GestureEventPayloadT;

export type GestureStateChangeEvent<GestureStateChangeEventPayloadT = Record<string, unknown>> = {
  nativeEvent: HandlerStateChangeEventPayload & GestureStateChangeEventPayloadT,
  timeStamp: number
}

export enum TouchEventType {
  UNDETERMINED = 0,
  TOUCHES_DOWN = 1,
  TOUCHES_MOVE = 2,
  TOUCHES_UP = 3,
  TOUCHES_CANCELLED = 4,
}


export type TouchData = {
  id: number;
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export type GestureTouchEvent = {
  handlerTag: number;
  numberOfTouches: number;
  state: State;
  eventType: TouchEventType;
  allTouches: TouchData[];
  changedTouches: TouchData[];
};