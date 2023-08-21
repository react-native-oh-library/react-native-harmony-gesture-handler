import { GestureHandler, GestureConfig, GestureHandlerDependencies, DEFAULT_TOUCH_SLOP } from "./GestureHandler"
import { AdaptedEvent } from "./Event"
import { State } from "./State"

const DEFAULT_MIN_DIST_SQ = DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP;

type PanGestureHandlerConfig = GestureConfig

export class PanGestureHandler extends GestureHandler<PanGestureHandlerConfig> {
  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private lastX = 0;
  private lastY = 0;
  private velocityX = 0;
  private velocityY = 0;
  private activationTimeout = 0;

  private get failOffsetXStart() {
    if (this.config.failOffsetXStart === undefined
      && this.config.failOffsetXEnd === undefined)
      return undefined
    return this.config.failOffsetXStart ?? Number.MIN_SAFE_INTEGER
  }

  private get failOffsetXEnd() {
    if (this.config.failOffsetXStart === undefined
      && this.config.failOffsetXEnd === undefined)
      return undefined
    return this.config.failOffsetXEnd ?? Number.MAX_SAFE_INTEGER
  }

  private get failOffsetYStart() {
    if (this.config.failOffsetYStart === undefined
      && this.config.failOffsetYEnd === undefined)
      return undefined
    return this.config.failOffsetYStart ?? Number.MIN_SAFE_INTEGER
  }

  private get failOffsetYEnd() {
    return this.config.failOffsetYEnd ?? Number.MAX_SAFE_INTEGER
  }

  private get activeOffsetXStart() {
    if (this.config.activeOffsetXStart === undefined
      && this.config.activeOffsetXEnd === undefined)
      return undefined
    return this.config.activeOffsetXStart ?? Number.MIN_SAFE_INTEGER
  }

  private get activeOffsetXEnd() {
    if (this.config.activeOffsetXStart === undefined
      && this.config.activeOffsetXEnd === undefined)
      return undefined
    return this.config.activeOffsetXEnd ?? Number.MAX_SAFE_INTEGER
  }

  private get activeOffsetYStart() {
    if (this.config.activeOffsetYStart === undefined
      && this.config.activeOffsetYEnd === undefined)
      return undefined
    return this.config.activeOffsetYStart ?? Number.MIN_SAFE_INTEGER
  }

  private get activeOffsetYEnd() {
    if (this.config.activeOffsetYStart === undefined
      && this.config.activeOffsetYEnd === undefined)
      return undefined
    return this.config.activeOffsetYEnd ?? Number.MAX_SAFE_INTEGER
  }

  private get minVelocityX() {
    return this.config.minVelocityX ?? this.config.minVelocity ?? Number.MAX_SAFE_INTEGER
  }

  private get minVelocityY() {
    return this.config.minVelocityY ?? this.config.minVelocityY ?? Number.MAX_SAFE_INTEGER
  }

  private minVelocitySq = Number.MAX_SAFE_INTEGER

  public constructor(deps: GestureHandlerDependencies) {
    super({ ...deps, logger: deps.logger.cloneWithPrefix("TapGestureHandler") })
  }

  public onPointerDown(e) {
    this.tracker.addToTracker(e);
    super.onPointerDown(e);

    this.lastX = this.tracker.getLastAvgX();
    this.lastY = this.tracker.getLastAvgY();

    this.tryBegin(e);
    this.tryActivating();
  }

  private tryActivating(): void {
    if (this.currentState === State.BEGAN) {
      if (this.shouldFail()) {
        this.fail();
      } else if (this.shouldActivate()) {
        this.activate();
      }
    }
  }

  private shouldFail(): boolean {
    const dx: number = this.getTranslationX();
    const dy: number = this.getTranslationY();
    const distanceSq = dx * dx + dy * dy;
    if (this.activateAfterLongPress > 0 && distanceSq > DEFAULT_MIN_DIST_SQ) {
      this.clearActivationTimeout();
      return true;
    }
    if (this.failOffsetXStart !== Number.MIN_SAFE_INTEGER && dx < this.failOffsetXStart) {
      return true;
    }
    if (this.failOffsetXEnd !== Number.MAX_SAFE_INTEGER && dx > this.failOffsetXEnd) {
      return true;
    }
    if (this.failOffsetYStart !== Number.MIN_SAFE_INTEGER && dy < this.failOffsetYStart) {
      return true;
    }
    return (this.failOffsetYEnd !== Number.MAX_SAFE_INTEGER && dy > this.failOffsetYEnd);
  }

  private getTranslationX(): number {
    return this.lastX - this.startX + this.offsetX;
  }

  private getTranslationY(): number {
    return this.lastY - this.startY + this.offsetY;
  }

  private shouldActivate(): boolean {
    const dx: number = this.getTranslationX();
    if (this.activeOffsetXStart !== Number.MAX_SAFE_INTEGER && dx < this.activeOffsetXStart
    ) {
      return true;
    }
    if (this.activeOffsetXEnd !== Number.MIN_SAFE_INTEGER && dx > this.activeOffsetXEnd) {
      return true;
    }
    const dy: number = this.getTranslationY();
    if (this.activeOffsetYStart !== Number.MAX_SAFE_INTEGER && dy < this.activeOffsetYStart) {
      return true;
    }
    if (this.activeOffsetYEnd !== Number.MIN_SAFE_INTEGER && dy > this.activeOffsetYEnd) {
      return true;
    }
    const distanceSq: number = dx * dx + dy * dy;
    if (this.minDistSq !== Number.MAX_SAFE_INTEGER && distanceSq >= this.minDistSq) {
      return true;
    }
    const vx: number = this.velocityX;
    if (
      this.minVelocityX !== Number.MAX_SAFE_INTEGER &&
        ((this.minVelocityX < 0 && vx <= this.minVelocityX) ||
          (this.minVelocityX >= 0 && this.minVelocityX <= vx))
    ) {
      return true;
    }
    const vy: number = this.velocityY;
    if (
      this.minVelocityY !== Number.MAX_SAFE_INTEGER &&
        ((this.minVelocityY < 0 && vy <= this.minVelocityY) ||
          (this.minVelocityY >= 0 && this.minVelocityY <= vy))
    ) {
      return true;
    }
    const velocitySq: number = vx * vx + vy * vy;
    return (
      this.minVelocitySq !== Number.MAX_SAFE_INTEGER &&
        velocitySq >= this.minVelocitySq
    );
  }

  private clearActivationTimeout(): void {
    clearTimeout(this.activationTimeout);
  }

  private tryBegin(e: AdaptedEvent): void {
    if (
      this.currentState === State.UNDETERMINED &&
        this.tracker.getTrackedPointersCount() >= this.config.minPointers
    ) {
      this.resetProgress();
      this.offsetX = 0;
      this.offsetY = 0;
      this.velocityX = 0;
      this.velocityY = 0;

      this.begin();

      if (this.activateAfterLongPress > 0) {
        this.activationTimeout = setTimeout(() => {
          this.activate();
        }, this.activateAfterLongPress);
      }
    } else {
      this.velocityX = this.tracker.getVelocityX(e.pointerId);
      this.velocityY = this.tracker.getVelocityY(e.pointerId);
    }
  }

  public getDefaultConfig() {
    return {}
  }

  private get activateAfterLongPress() {
    return this.config.activateAfterLongPress ?? 0
  }

  private get minDistSq() {
    if (this.config.minDist !== undefined) {
      return this.config.minDist * this.config.minDist;
    } else if (this.hasCustomActivationCriteria()) {
      return Number.MAX_SAFE_INTEGER;
    }
    return DEFAULT_MIN_DIST_SQ
  }

  private hasCustomActivationCriteria() {
    const criterias: (keyof PanGestureHandlerConfig)[] = [
      'activeOffsetXStart',
      'activeOffsetXEnd',
      'failOffsetXStart',
      'failOffsetXEnd',
      'activeOffsetYStart',
      'activeOffsetYEnd',
      'failOffsetYStart',
      'failOffsetYEnd',
      'minVelocityX',
      'minVelocityY',
    ]
    for (const key in this.config) {
      if (criterias.indexOf(key as keyof PanGestureHandlerConfig) >= 0) {
        return true
      }
    }
    return false
  }
}