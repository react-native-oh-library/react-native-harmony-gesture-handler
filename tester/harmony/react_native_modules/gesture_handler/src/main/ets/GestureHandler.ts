import type { GestureHandlerOrchestrator } from "./GestureHandlerOrchestrator"
import type { PointerTracker } from "./PointerTracker"
import type { View } from "./View"
import { State } from "./State"
import { HitSlop, Directions, AdaptedEvent } from "./Event"

export interface Handler {
  handlerTag: number;
}

export interface GestureConfig {
  enabled?: boolean;
  simultaneousHandlers?: Handler[] | null;
  waitFor?: Handler[] | null;
  hitSlop?: HitSlop;
  shouldCancelWhenOutside?: boolean;
  activateAfterLongPress?: number;
  failOffsetXStart?: number;
  failOffsetYStart?: number;
  failOffsetXEnd?: number;
  failOffsetYEnd?: number;
  activeOffsetXStart?: number;
  activeOffsetXEnd?: number;
  activeOffsetYStart?: number;
  activeOffsetYEnd?: number;
  minPointers?: number;
  maxPointers?: number;
  minDist?: number;
  minDistSq?: number;
  minVelocity?: number;
  minVelocityX?: number;
  minVelocityY?: number;
  minVelocitySq?: number;
  maxDist?: number;
  maxDistSq?: number;
  numberOfPointers?: number;
  minDurationMs?: number;
  numberOfTaps?: number;
  maxDurationMs?: number;
  maxDelayMs?: number;
  maxDeltaX?: number;
  maxDeltaY?: number;
  shouldActivateOnStart?: boolean;
  disallowInterruption?: boolean;
  direction?: typeof Directions;
  // --- Tap
  needsPointerData?: boolean
  minNumberOfPointers?: number
}

type PointerId = number

export abstract class GestureHandler {
  protected config: GestureConfig
  protected currentState: State

  constructor(protected view: View,
              protected handlerTag: number,
              protected orchestrator: GestureHandlerOrchestrator,
              protected tracker: PointerTracker
  ) {
  }

  public abstract onPointerDown(e: AdaptedEvent): void
  public abstract onPointerUp(e: AdaptedEvent): void
  public abstract onAdditionalPointerAdd(e: AdaptedEvent): void
  public abstract onAdditionalPointerRemove(e: AdaptedEvent): void
  public abstract onPointerMove(e: AdaptedEvent): void
  public abstract onPointerEnter(e: AdaptedEvent): void
  public abstract onPointerOut(e: AdaptedEvent): void
  public abstract onPointerCancel(e: AdaptedEvent): void
  public abstract onPointerOutOfBounds(e: AdaptedEvent): void

  protected begin(): void {
    if (!this.isWithinHitSlop()) return;
    if (this.currentState === State.UNDETERMINED) {
      this.moveToState(State.BEGAN);
    }
  }

  private isWithinHitSlop(): boolean {
    if (!this.config.hitSlop) {
      return true;
    }

    const width = this.view.getBoundingRect().width;
    const height = this.view.getBoundingRect().height;

    let left = 0;
    let top = 0;
    let right: number = width;
    let bottom: number = height;

    if (this.config.hitSlop.horizontal !== undefined) {
      left -= this.config.hitSlop.horizontal;
      right += this.config.hitSlop.horizontal;
    }

    if (this.config.hitSlop.vertical !== undefined) {
      top -= this.config.hitSlop.vertical;
      bottom += this.config.hitSlop.vertical;
    }

    if (this.config.hitSlop.left !== undefined) {
      left = -this.config.hitSlop.left;
    }

    if (this.config.hitSlop.right !== undefined) {
      right = width + this.config.hitSlop.right;
    }

    if (this.config.hitSlop.top !== undefined) {
      top = -this.config.hitSlop.top;
    }

    if (this.config.hitSlop.bottom !== undefined) {
      bottom = width + this.config.hitSlop.bottom;
    }
    if (this.config.hitSlop.width !== undefined) {
      if (this.config.hitSlop.left !== undefined) {
        right = left + this.config.hitSlop.width;
      } else if (this.config.hitSlop.right !== undefined) {
        left = right - this.config.hitSlop.width;
      }
    }

    if (this.config.hitSlop.height !== undefined) {
      if (this.config.hitSlop.top !== undefined) {
        bottom = top + this.config.hitSlop.height;
      } else if (this.config.hitSlop.bottom !== undefined) {
        top = bottom - this.config.hitSlop.height;
      }
    }

    const rect = this.view.getBoundingRect();
    const offsetX: number = this.tracker.getLastX() - rect.x;
    const offsetY: number = this.tracker.getLastY() - rect.y;

    if (
      offsetX >= left &&
        offsetX <= right &&
        offsetY >= top &&
        offsetY <= bottom
    ) {
      return true;
    }
    return false;
  }

  protected activate(): void {
    if (this.currentState === State.UNDETERMINED || this.currentState === State.BEGAN) {
      this.moveToState(State.ACTIVE)
    }
  }

  protected moveToState(state: State) {
    if (state === this.currentState) return;
    const oldState = this.currentState
    this.currentState = state;
    if (this.tracker.getTrackedPointersCount() > 0 && this.config.needsPointerData && this.isFinished()) {
      this.cancelTouches()
    }
    this.orchestrator.onHandlerStateChange(this, state, oldState)
    this.stateDidChange(state, oldState)
  }

  private isFinished() {
    return (
      this.currentState === State.END ||
        this.currentState === State.FAILED ||
        this.currentState === State.CANCELLED
    );
  }

  private cancelTouches() {
    // TODO
  }

  protected stateDidChange(newState: State, oldState: State) {}


  public updateGestureConfig(config: GestureConfig): void {
    this.config = config
  }

  protected resetConfig(): void {
    this.config = this.getDefaultConfig()
  }

  abstract getDefaultConfig(): GestureConfig

  // ----

  public isEnabled(): boolean {
    // TODO
    return false
  }

  public isActive(): boolean {
    // TODO
    return false
  }

  public cancel(): void {
    // TODO
  }

  public getState(): State {
    return this.currentState
  }

  public sendEvent(args: {
    oldState: State,
    newState: State
  }): void {
    // TODO
  }

  setAwaiting(isAwaiting: boolean): void {
    // TODO
  }

  shouldWaitForHandlerFailure(handler: GestureHandler): boolean {
    // TODO
    return false
  }

  shouldRequireToWaitForFailure(handler: GestureHandler): boolean {
    // TODO
    return false
  }

  shouldWaitFor(otherHandler: GestureHandler): boolean {
    // TODO
    return false
  }

  reset(): void {
    // TODO
  }

  isAwaiting(): boolean {
    // TODO
    return false
  }

  setActive(isActive: boolean): void {
    // TODO
  }

  setActivationIndex(activationIndex: number): void {
    // TODO
  }

  setShouldResetProgress(shouldResetProgress: boolean): void {
    // TODO
  }

  fail(): void {
    // TODO
  }

  shouldBeCancelledByOther(otherHandler: GestureHandler): boolean {
    // TODO
    return false
  }

  getTrackedPointersID(): PointerId[] {
    // TODO
    return []
  }

  shouldRecognizeSimultaneously(otherHandler: GestureHandler): boolean {
    // TODO
    return false
  }
}
