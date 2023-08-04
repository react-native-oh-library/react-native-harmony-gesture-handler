import type { GestureHandlerOrchestrator } from "./GestureHandlerOrchestrator"
import type { PointerTracker } from "./PointerTracker"
import { State } from "./State"
import { HitSlop, Directions } from "./Event"


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
  needsPointerData?: boolean
}

type PointerId = number

export interface View {
  getBoundingRect(): {x: number, y: number, width: number, height: number}
}

export abstract class GestureHandler {
  private config: GestureConfig
  private currentState: State

  constructor(private view: View,
              private handlerTag: number,
              private orchestrator: GestureHandlerOrchestrator,
              private tracker: PointerTracker
  ) {
  }

  public activate(): void {
    if (this.currentState === State.UNDETERMINED || this.currentState === State.BEGAN) {
      this.moveToState(State.ACTIVE)
    }
  }

  public moveToState(state: State) {
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
