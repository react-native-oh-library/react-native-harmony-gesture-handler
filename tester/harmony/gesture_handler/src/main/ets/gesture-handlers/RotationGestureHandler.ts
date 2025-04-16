import { GestureHandler, State, IncomingEvent, GestureConfig, GestureHandlerDependencies, getStateName } from '../core';
import RotationGestureDetector, { RotationGestureListener, } from './detectors/RotationGestureDetector';

const ROTATION_RECOGNITION_THRESHOLD = Math.PI / 36;

export class RotationGestureHandler extends GestureHandler {
  private rotation = 0;
  private velocity = 0;

  private cachedAnchorX = 0;
  private cachedAnchorY = 0;
  private unlockScrolls: (() => void) | undefined

  constructor(deps: GestureHandlerDependencies) {
    super({ ...deps, logger: deps.logger.cloneAndJoinPrefix("RotationGestureHandler") })
  }

  public override getName(): string {
    return "RotationGestureHandler"
  }

  public override isGestureContinuous(): boolean {
    return true
  }

  private rotationGestureListener: RotationGestureListener = {
    onRotationBegin: (_detector: RotationGestureDetector): boolean => true,
    onRotation: (detector: RotationGestureDetector): boolean => {
      const logger = this.logger.cloneAndJoinPrefix("onRotation")
      const previousRotation: number = this.rotation;
      this.rotation += detector.getRotation();
      const delta = detector.getTimeDelta();
      if (delta > 0) {
        this.velocity = (this.rotation - previousRotation) / delta;
      }
      if (
        Math.abs(this.rotation) > ROTATION_RECOGNITION_THRESHOLD &&
          this.currentState === State.BEGAN
      ) {
        this.activate();
      } else {
        logger.debug({
          result: "NOT_ACTIVATED",
          currentState: getStateName(this.currentState),
          rotation: Math.abs(this.rotation),
          ROTATION_RECOGNITION_THRESHOLD
        })
      }
      return true;
    },
    onRotationEnd: (_detector: RotationGestureDetector): void => {
      this.end();
    },
  };

  private rotationGestureDetector: RotationGestureDetector =
    new RotationGestureDetector(this.rotationGestureListener);

  getDefaultConfig(): GestureConfig {
    return { shouldCancelWhenOutside: false }
  }

  protected transformNativeEvent() {
    const logger = this.logger.cloneAndJoinPrefix("transformNativeEvent");
    const result = {
      rotation: this.rotation ? this.rotation : 0,
      anchorX: this.getAnchorX(),
      anchorY: this.getAnchorY(),
      velocity: this.velocity ? this.velocity : 0,
    };
    logger.debug({ result });
    return result;
  }

  public getAnchorX(): number {
    const anchorX = this.rotationGestureDetector.getAnchorX();

    return anchorX ? anchorX : this.cachedAnchorX;
  }

  public getAnchorY(): number {
    const anchorY = this.rotationGestureDetector.getAnchorY();

    return anchorY ? anchorY : this.cachedAnchorY;
  }

  public onPointerDown(event: IncomingEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
  }

  public onAdditionalPointerAdd(event: IncomingEvent): void {
    this.tracker.addToTracker(event);
    super.onAdditionalPointerAdd(event);
    this.tryBegin();
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
  }

  public onPointerMove(event: IncomingEvent): void {
    if (this.tracker.getTrackedPointersCount() < 2) {
      return;
    }
    if (this.getAnchorX()) {
      this.cachedAnchorX = this.getAnchorX();
    }
    if (this.getAnchorY()) {
      this.cachedAnchorY = this.getAnchorY();
    }
    this.tracker.track(event);
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
    super.onPointerMove(event);
  }

  public onPointerOutOfBounds(event: IncomingEvent): void {
    if (this.tracker.getTrackedPointersCount() < 2) {
      return;
    }
    if (this.getAnchorX()) {
      this.cachedAnchorX = this.getAnchorX();
    }
    if (this.getAnchorY()) {
      this.cachedAnchorY = this.getAnchorY();
    }
    this.tracker.track(event);
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
    super.onPointerOutOfBounds(event);
  }

  public onPointerUp(event: IncomingEvent): void {
    super.onPointerUp(event);
    this.tracker.removeFromTracker(event.pointerId);
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
    if (this.currentState === State.ACTIVE) {
      this.end();
    } else {
      this.fail();
      this.reset();
    }
  }

  public onAdditionalPointerRemove(event: IncomingEvent): void {
    if (this.currentState === State.BEGAN) {
      /**
       * Sometimes this method is called quickly after onAdditionalPointerAdd. When this happens, this GH is in the BEGAN state,
       * and if this conditional logic is removed, the GH end up in the END state forever.
       */
      this.fail();
      this.reset();
      return;
    }
    super.onAdditionalPointerRemove(event);
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
    this.tracker.removeFromTracker(event.pointerId);
  }

  protected tryBegin(): void {
    if (this.currentState !== State.UNDETERMINED) {
      return;
    }

    this.begin();
  }

  public activate(): void {
    super.activate();
  }

  protected onReset(): void {
    const logger = this.logger.cloneAndJoinPrefix("onReset");
    logger.debug("onReset")
    if (this.currentState === State.ACTIVE) {
      logger.debug("onReset cancelled")
      return;
    }
    this.rotation = 0;
    this.velocity = 0;
    this.rotationGestureDetector.reset();
  }

  protected onStateChange(newState: State, oldState: State) {
    super.onStateChange(newState, oldState)
    if (newState === State.BEGAN) {
      this.unlockScrolls = this.scrollLocker.lockScrollContainingViewTag(this.view?.getTag(), this.config.simultaneousHandlers)
    } else if (newState !== State.ACTIVE) {
      this.unlockScrolls?.()
    }
  }
}
