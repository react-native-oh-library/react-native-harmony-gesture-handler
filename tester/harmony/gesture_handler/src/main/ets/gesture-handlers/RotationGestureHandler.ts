import { GestureHandler, State, IncomingEvent, GestureConfig, GestureHandlerDependencies } from '../core';
import RotationGestureDetector, { RotationGestureListener, } from './detectors/RotationGestureDetector';

const ROTATION_RECOGNITION_THRESHOLD = Math.PI / 36;

export class RotationGestureHandler extends GestureHandler {
  private rotation = 0;
  private velocity = 0;

  private cachedAnchorX = 0;
  private cachedAnchorY = 0;
  private unlockScrolls: (() => void) | undefined

  constructor(deps: GestureHandlerDependencies) {
    super({ ...deps, logger: deps.logger.cloneWithPrefix("RotationGestureHandler") })
  }

  private rotationGestureListener: RotationGestureListener = {
    onRotationBegin: (_detector: RotationGestureDetector): boolean => true,
    onRotation: (detector: RotationGestureDetector): boolean => {
      const previousRotation: number = this.rotation;
      this.rotation += detector.getRotation();

      const delta = detector.getTimeDelta();

      if (delta > 0) {
        this.velocity = (this.rotation - previousRotation) / delta;
      }

      if (
        Math.abs(this.rotation) >= ROTATION_RECOGNITION_THRESHOLD &&
          this.currentState === State.BEGAN
      ) {
        this.activate();
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
    return {
      rotation: this.rotation ? this.rotation : 0,
      anchorX: this.getAnchorX(),
      anchorY: this.getAnchorY(),
      velocity: this.velocity ? this.velocity : 0,
    };
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
    if (this.currentState !== State.ACTIVE) {
      return;
    }
    if (this.currentState === State.ACTIVE) {
      this.end();
    } else {
      this.fail();
    }
  }

  public onAdditionalPointerRemove(event: IncomingEvent): void {
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
    if (this.currentState === State.ACTIVE) {
      return;
    }

    this.rotation = 0;
    this.velocity = 0;
    this.rotationGestureDetector.reset();
  }

  protected onStateChange(newState: State, oldState: State) {
    super.onStateChange(newState, oldState)
    if (newState === State.BEGAN) {
      this.unlockScrolls = this.scrollLocker.lockScrollContainingViewTag(this.view?.getTag())
    } else if (newState !== State.ACTIVE) {
      this.unlockScrolls?.()
    }
  }
}
