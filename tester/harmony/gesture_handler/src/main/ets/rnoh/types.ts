export enum TouchType {
  Down,
  Up,
  Move,
  Cancel
}

interface BaseEvent {
  timestamp: number;
}

export interface TouchObject {
  type: TouchType;
  id: number;
  windowX: number;
  windowY: number;
  x: number;
  y: number;
}

export interface TouchEvent extends BaseEvent {
  type: TouchType;
  touches: TouchObject[];
  changedTouches: TouchObject[];
}