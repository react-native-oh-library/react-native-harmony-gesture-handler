export interface HitSlop {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  horizontal?: number;
  vertical?: number;
  width?: number;
  height?: number;
}

export const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
} as const;

export enum PointerType {
  NONE = 'none',
  MOUSE = 'mouse',
  TOUCH = 'touch',
  PEN = 'pen',
}

export enum EventTypes {
  DOWN,
  ADDITIONAL_POINTER_DOWN,
  UP,
  ADDITIONAL_POINTER_UP,
  MOVE,
  ENTER,
  OUT,
  CANCEL,
}

type TouchList = unknown

export enum TouchEventType {
  UNDETERMINED,
  DOWN,
  MOVE,
  UP,
  CANCELLED,
}

export interface AdaptedEvent {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  eventType: EventTypes;
  pointerType: PointerType;
  buttons: number;
  time: number;
  allTouches?: TouchList;
  changedTouches?: TouchList;
  touchEventType?: TouchEventType;
}

export interface TrackerElement {
  lastX: number;
  lastY: number;
  timeStamp: number;
  velocityX: number;
  velocityY: number;
}