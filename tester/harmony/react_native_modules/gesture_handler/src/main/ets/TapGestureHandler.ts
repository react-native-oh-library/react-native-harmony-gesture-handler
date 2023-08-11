import { GestureHandler } from "./GestureHandler"
import { AdaptedEvent, EventType } from "./Event"
import { State } from "./State"

const DEFAULT_MAX_DURATION_MS = 500;
const DEFAULT_NUMBER_OF_TAPS = 1;
const DEFAULT_MAX_DELAY_MS = 500;

export class TapGestureHandler extends GestureHandler {
  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private lastX = 0;
  private lastY = 0;
  private maxNumberOfPointersSoFar = 0;
  private numberOfTapsSoFar: number = 0;
  private waitTimeout: number | undefined;
  private delayTimeout: number | undefined;

  onPointerDown(event) {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
    this.trySettingPosition(event);
    this.lastX = event.x;
    this.lastY = event.y;
    this.updateState(event);
  }

  getDefaultConfig() {
    return {}
  }

  private trySettingPosition(event: AdaptedEvent): void {
    if (this.currentState !== State.UNDETERMINED) return;
    this.offsetX = 0;
    this.offsetY = 0;
    this.startX = event.x;
    this.startY = event.y;
  }

  private updateState(event: AdaptedEvent): void {
    if (this.maxNumberOfPointersSoFar < this.tracker.getTrackedPointersCount()) {
      this.maxNumberOfPointersSoFar = this.tracker.getTrackedPointersCount()
    }
    if (this.shouldFail()) {
      this.fail()
      return;
    }
    switch (this.currentState) {
      case State.UNDETERMINED:
        if (event.eventType === EventType.DOWN)
          this.begin()
        this.startTap();
        break;
      case State.BEGAN:
        if (event.eventType === EventType.UP)
          this.endTap();
        if (event.eventType === EventType.DOWN)
          this.startTap();
        break;
      default:
        break;
    }
  }

  private shouldFail(): boolean {
    const maxDeltaX = this.config.maxDeltaX ?? Number.MIN_SAFE_INTEGER
    const maxDeltaY = this.config.maxDeltaY ?? Number.MIN_SAFE_INTEGER
    const maxDistSq = this.config.maxDistSq ?? Number.MIN_SAFE_INTEGER

    const dx = this.lastX - this.startX + this.offsetX;
    if (
      maxDeltaX !== Number.MIN_SAFE_INTEGER &&
        Math.abs(dx) > maxDeltaX
    ) {
      return true;
    }
    const dy = this.lastY - this.startY + this.offsetY;
    if (
      maxDeltaY !== Number.MIN_SAFE_INTEGER &&
        Math.abs(dy) > maxDeltaY
    ) {
      return true;
    }
    const distSq = dy * dy + dx * dx;
    return (
      maxDistSq !== Number.MIN_SAFE_INTEGER && distSq > maxDistSq
    );
  }

  private startTap() {
    this.clearTimeouts();
    this.waitTimeout = setTimeout(() => this.fail(), this.config.maxDurationMs ?? DEFAULT_MAX_DURATION_MS);
  }

  private clearTimeouts() {
    clearTimeout(this.waitTimeout);
    clearTimeout(this.delayTimeout);
  }

  private endTap() {
    this.clearTimeouts();
    if (
      ++this.numberOfTapsSoFar === (this.config.numberOfTaps ?? DEFAULT_NUMBER_OF_TAPS) &&
        this.maxNumberOfPointersSoFar >= this.config.minNumberOfPointers
    ) {
      this.activate();
    } else {
      this.delayTimeout = setTimeout(() => this.fail(), this.config.maxDelayMs ?? DEFAULT_MAX_DELAY_MS);
    }
  }
}