import { GestureHandler, IncomingEvent, GestureConfig, State, GestureHandlerDependencies } from '../core';

const DEFAULT_MIN_DURATION_MS = 500;
const DEFAULT_MAX_DIST_DP = 10;
const SCALING_FACTOR = 10;

export class LongPressGestureHandler extends GestureHandler {
  private minDurationMs = DEFAULT_MIN_DURATION_MS;
  private defaultMaxDistSq = DEFAULT_MAX_DIST_DP * SCALING_FACTOR;

  private maxDistSq = this.defaultMaxDistSq;
  private startX = 0;
  private startY = 0;

  private startTime = 0;
  private previousTime = 0;

  private activationTimeout: number | undefined;

  constructor(deps: GestureHandlerDependencies) {
    super({...deps, logger: deps.logger.cloneWithPrefix("LongPressGestureHandler")})
  }

  public getDefaultConfig() {
    return {}
  }

  protected transformNativeEvent() {
    return {
      ...super.transformNativeEvent(),
      duration: Date.now() - this.startTime,
    };
  }

  public updateGestureConfig({ enabled = true, ...props }: GestureConfig): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

    if (this.config.minDurationMs !== undefined) {
      this.minDurationMs = this.config.minDurationMs;
    }

    if (this.config.maxDist !== undefined) {
      this.maxDistSq = this.config.maxDist * this.config.maxDist;
    }
  }



  protected resetConfig(): void {
    super.resetConfig();
    this.minDurationMs = DEFAULT_MIN_DURATION_MS;
    this.maxDistSq = this.defaultMaxDistSq;
  }

  protected onStateChange(newState: State, oldState: State): void {
    super.onStateChange(newState, oldState)
    clearTimeout(this.activationTimeout);
  }

  public onPointerDown(event: IncomingEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
    this.tryBegin(event);
    this.tryActivate();
    this.checkDistanceFail(event);
  }

  public onPointerMove(event: IncomingEvent): void {
    super.onPointerMove(event);
    this.tracker.track(event);
    this.checkDistanceFail(event);
  }

  public onPointerUp(event: IncomingEvent): void {
    super.onPointerUp(event);
    this.tracker.removeFromTracker(event.pointerId);

    if (this.currentState === State.ACTIVE) {
      this.end();
    } else {
      this.fail();
    }
  }

  private tryBegin(event: IncomingEvent): void {
    if (this.currentState !== State.UNDETERMINED) {
      return;
    }

    this.previousTime = Date.now();
    this.startTime = this.previousTime;

    this.begin();

    this.startX = event.x;
    this.startY = event.y;
  }

  private tryActivate(): void {
    if (this.minDurationMs > 0) {
      if (this.activationTimeout) {
        clearTimeout(this.activationTimeout)
      }
      this.activationTimeout = setTimeout(() => {
        this.activate();
      }, this.minDurationMs);
    } else if (this.minDurationMs === 0) {
      this.activate();
    }
  }

  private checkDistanceFail(event: IncomingEvent): void {
    const dx = event.x - this.startX;
    const dy = event.y - this.startY;
    const distSq = dx * dx + dy * dy;

    if (distSq <= this.maxDistSq) {
      return;
    }

    if (this.currentState === State.ACTIVE) {
      this.cancel();
    } else {
      this.fail();
    }
  }
}
