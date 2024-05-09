import { GestureHandler, DEFAULT_TOUCH_SLOP, IncomingEvent, GestureConfig, State, GestureHandlerDependencies } from "../core"
import ScaleGestureDetector, { ScaleGestureListener } from "../detectors/ScaleGestureDetector";



export class PinchGestureHandler extends GestureHandler {
    private scale = 1;
    private velocity = 0;

    private startingSpan = 0;
    private spanSlop = DEFAULT_TOUCH_SLOP;

    private scaleDetectorListener: ScaleGestureListener = {
      onScaleBegin: (detector: ScaleGestureDetector): boolean => {
        this.startingSpan = detector.getCurrentSpan();
        return true;
      },
      onScale: (detector: ScaleGestureDetector): boolean => {
        const prevScaleFactor: number = this.scale;
        this.scale *= detector.getScaleFactor(
          this.tracker.getTrackedPointersCount()
        );

        const delta = detector.getTimeDelta();
        if (delta > 0) {
          this.velocity = (this.scale - prevScaleFactor) / delta;
        }

        if (
          Math.abs(this.startingSpan - detector.getCurrentSpan()) >=
            this.spanSlop &&
          this.currentState === State.BEGAN
        ) {
          this.activate();
        }
        return true;
      },
      onScaleEnd: (
        _detector: ScaleGestureDetector
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      ): void => {},
    };

    private scaleGestureDetector: ScaleGestureDetector = new ScaleGestureDetector(
      this.scaleDetectorListener
    );


    public constructor(deps: GestureHandlerDependencies) {
        super({ ...deps, logger: deps.logger.cloneWithPrefix("PinchGestureHandler") })
        this.setShouldCancelWhenOutside(false);
    }

    public getDefaultConfig() {
      return {}
    }

    public updateGestureConfig({ enabled = true, ...props }: GestureConfig): void {
      super.updateGestureConfig({ enabled: enabled, ...props });
    }

    protected transformNativeEvent() {
      return {
        focalX: this.scaleGestureDetector.getFocusX(),
        focalY: this.scaleGestureDetector.getFocusY(),
        velocity: this.velocity,
        scale: this.scale,
      };
    }

    public onPointerDown(event: IncomingEvent): void {
      this.tracker.addToTracker(event);
      super.onPointerDown(event);
    }

    public onAdditionalPointerAdd(event: IncomingEvent): void {
      this.tracker.addToTracker(event);
      super.onAdditionalPointerAdd(event);
      this.tryBegin();
      this.scaleGestureDetector.onTouchEvent(event, this.tracker);
    }

    public onPointerUp(event: IncomingEvent): void {
      super.onPointerUp(event);
      this.tracker.removeFromTracker(event.pointerId);
      if (this.currentState !== State.ACTIVE) {
        return;
      }
      this.scaleGestureDetector.onTouchEvent(event, this.tracker);

      if (this.currentState === State.ACTIVE) {
        this.end();
      } else {
        this.fail();
      }
    }

    public onAdditionalPointerRemove(event: IncomingEvent): void {
      super.onAdditionalPointerRemove(event);
      this.scaleGestureDetector.onTouchEvent(event, this.tracker);
      this.tracker.removeFromTracker(event.pointerId);

      if (
        this.currentState === State.ACTIVE &&
        this.tracker.getTrackedPointersCount() < 2
      ) {
        this.end();
      }
    }

    public onPointerMove(event: IncomingEvent): void {
        if (this.tracker.getTrackedPointersCount() < 2) {
        return;
      }
      this.tracker.track(event);

      this.scaleGestureDetector.onTouchEvent(event, this.tracker);
      super.onPointerMove(event);
    }

    public onPointerOutOfBounds(event: IncomingEvent): void {
      if (this.tracker.getTrackedPointersCount() < 2) {
        return;
      }
      this.tracker.track(event);

      this.scaleGestureDetector.onTouchEvent(event, this.tracker);
      super.onPointerOutOfBounds(event);
    }

    private tryBegin(): void {
        if (this.currentState !== State.UNDETERMINED) {
        return;
      }

      this.resetProgress();
      this.begin();
    }

    public activate(force?: boolean): void {
        if (this.currentState !== State.ACTIVE) {
        this.resetProgress();
      }

      super.activate();
    }

    protected onReset(): void {
      this.resetProgress();
    }

    protected resetProgress(): void {
      if (this.currentState === State.ACTIVE) {
        return;
      }
      this.velocity = 0;
      this.scale = 1;
    }
}