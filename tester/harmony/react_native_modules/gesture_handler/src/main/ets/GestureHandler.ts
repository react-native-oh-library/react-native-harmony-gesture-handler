import type { GestureHandlerOrchestrator } from "./GestureHandlerOrchestrator"

export enum State {
  /** This is the initial state of each handler and it goes into this state after it's done recognizing a gesture. */
  UNDETERMINED,

  /** A handler received some touches but for some reason didn't recognize them. For example, if a finger travels more
   * distance than a defined maxDist property allows, then the handler won't become active but will fail instead.
   * Afterwards, it's state will be reset to UNDETERMINED. */
  FAILED,

  /** Handler has started receiving touch stream but hasn't yet received enough data to either fail or activate. */
  BEGAN,

  /** The gesture recognizer has received a signal (possibly new touches or a command from the touch system controller)
   * resulting in the cancellation of a continuous gesture. The gesture's state will become CANCELLED until it is
   * finally reset to the initial state, UNDETERMINED. */
  CANCELLED,

  /** Handler has recognized a gesture. It will become and stay in the ACTIVE state until the gesture finishes
   * (e.g. when user lifts the finger) or gets cancelled by the touch system. Under normal circumstances the state will
   * then turn into END. In the case that a gesture is cancelled by the touch system, its state would then become
   * CANCELLED. Learn about discrete and continuous handlers here to understand how long a handler can be kept in the
   * ACTIVE state.
   * */
  ACTIVE,

  /** The gesture recognizer has received touches signalling the end of a gesture. Its state will become END until it is
   * reset to UNDETERMINED.
   * */
  END,
}


interface GestureConfig {}

type PointerId = number


export abstract class GestureHandler {
  private config: GestureConfig
  private currentState: State

  constructor(private viewTag: number,
              private handlerTag: number,
              private orchestrator: GestureHandlerOrchestrator) {
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
    this.orchestrator.onHandlerStateChange(this, state, oldState)
  }

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
