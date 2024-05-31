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

const RIGHT = 1;
const LEFT = 2;
const UP = 4;
const DOWN = 8;

export const Directions = {
  RIGHT: RIGHT,
  LEFT: LEFT,
  UP: UP,
  DOWN: DOWN,
} as const;

export type Directions = typeof Directions[keyof typeof Directions];

export const DiagonalDirections = {
  UP_RIGHT: UP | RIGHT,
  DOWN_RIGHT: DOWN | RIGHT,
  UP_LEFT: UP | LEFT,
  DOWN_LEFT: DOWN | LEFT,
} as const;

export type DiagonalDirections =
  typeof DiagonalDirections[keyof typeof DiagonalDirections];

export enum PointerType {
  NONE = 'none',
  MOUSE = 'mouse',
  TOUCH = 'touch',
  PEN = 'pen',
}

export enum EventType {
  DOWN = "DOWN",
  ADDITIONAL_POINTER_DOWN = "ADDITIONAL_POINTER_DOWN",
  UP = "UP",
  ADDITIONAL_POINTER_UP = "ADDITIONAL_POINTER_UP",
  MOVE = "MOVE",
  ENTER = "ENTER",
  OUT = "OUT",
  CANCEL = "CANCEL",
}

export type Touch = {id: number, x: number, y: number, absoluteX: number, absoluteY: number}

export enum TouchEventType {
  UNDETERMINED = 0,
  DOWN = 1,
  MOVE = 2,
  UP = 3,
  CANCELLED = 4,
}

export interface IncomingEvent {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  eventType: EventType;
  pointerType: PointerType;
  buttons: number;
  time: number;
  allTouches?: Touch[];
  changedTouches?: Touch[];
  touchEventType?: TouchEventType;
}

