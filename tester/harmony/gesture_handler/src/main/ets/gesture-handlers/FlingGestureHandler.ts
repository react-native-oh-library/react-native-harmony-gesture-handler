import {
  GestureHandler,
  State,
  DiagonalDirections,
  Directions,
  Vector2D,
  IncomingEvent,
  GestureHandlerDependencies
} from '../core';

const DEFAULT_MAX_DURATION_MS = 800;
const DEFAULT_MIN_VELOCITY = 700;
/**
 * DEFAULT_ALIGNMENT_CONE defines the angular tolerance for fling gestures in degrees.
 *               *
 *           *
 *       *
 *   *------------>
 *       *
 *           *
 *               *
 */
const DEFAULT_ALIGNMENT_CONE = 30;
const DEFAULT_DIRECTION: Directions = Directions.RIGHT;
const DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1;
const AXIAL_DEVIATION_COSINE = coneToDeviation(DEFAULT_ALIGNMENT_CONE);
const DIAGONAL_DEVIATION_COSINE = coneToDeviation(90 - DEFAULT_ALIGNMENT_CONE);

export class FlingGestureHandler extends GestureHandler {
  constructor(deps: GestureHandlerDependencies) {
    super({ ...deps, logger: deps.logger.cloneWithPrefix("FlingGestureHandler") })
  }

  getDefaultConfig() {
    return {}
  }

  private get direction(): Directions {
    return this.config.direction ?? DEFAULT_DIRECTION
  }

  private get numberOfPointersRequired() {
    return this.config.numberOfPointers ?? DEFAULT_NUMBER_OF_TOUCHES_REQUIRED
  }

  private get maxDurationMs() {
    return this.config.maxDurationMs ?? DEFAULT_MAX_DURATION_MS
  }

  private get minVelocity() {
    return this.config.minVelocity ?? DEFAULT_MIN_VELOCITY
  }

  private delayTimeout!: number;
  private maxNumberOfPointersSimultaneously = 0;
  private keyPointer = NaN;

  private startFling(): void {
    this.logger.info("startFling")
    this.begin();

    this.maxNumberOfPointersSimultaneously = 1;

    this.delayTimeout = setTimeout(() => this.fail(), this.maxDurationMs);
  }

  private tryEndFling(): boolean {
    const logger = this.logger.cloneWithPrefix("tryEndFling")
    const velocityVector = this.tracker.getVelocity(this.keyPointer);

    const getAlignment = (
      direction: Directions | DiagonalDirections,
      minimalAlignmentCosine: number
    ) => {
      return (
        (direction & this.direction) === direction &&
          velocityVector.computeCosine(
            Vector2D.fromDirection(direction),
          ) > minimalAlignmentCosine
      );
    };

    const axialDirectionsList = Object.values(Directions);
    const diagonalDirectionsList = Object.values(DiagonalDirections);

    // list of alignments to all activated directions
    const axialAlignmentList = axialDirectionsList.map((direction) =>
    getAlignment(direction, AXIAL_DEVIATION_COSINE)
    );

    const diagonalAlignmentList = diagonalDirectionsList.map((direction) =>
    getAlignment(direction, DIAGONAL_DEVIATION_COSINE)
    );

    const isAligned =
      axialAlignmentList.some(Boolean) || diagonalAlignmentList.some(Boolean);

    const isFast = velocityVector.magnitude > this.minVelocity;

    if (
      this.maxNumberOfPointersSimultaneously ===
      this.numberOfPointersRequired &&
        isAligned &&
        isFast
    ) {
      clearTimeout(this.delayTimeout);
      this.activate();

      return true;
    }

    return false;
  }

  private endFling() {
    this.logger.info("endFling")
    if (!this.tryEndFling()) {
      this.fail();
    }
  }

  public onPointerDown(event: IncomingEvent): void {
    this.tracker.addToTracker(event);
    this.keyPointer = event.pointerId;

    super.onPointerDown(event);
    this.newPointerAction();
  }

  public onAdditionalPointerAdd(event: IncomingEvent): void {
    this.tracker.addToTracker(event);
    super.onAdditionalPointerAdd(event);
    this.newPointerAction();
  }

  private newPointerAction(): void {
    if (this.currentState === State.UNDETERMINED) {
      this.startFling();
    }

    if (this.currentState !== State.BEGAN) {
      return;
    }

    this.tryEndFling();

    if (
      this.tracker.getTrackedPointersCount() >
      this.maxNumberOfPointersSimultaneously
    ) {
      this.maxNumberOfPointersSimultaneously =
        this.tracker.getTrackedPointersCount();
    }
  }

  private pointerMoveAction(event: IncomingEvent): void {
    this.logger.cloneWithPrefix("pointerMoveAction").info(JSON.stringify(event))
    this.tracker.track(event);

    if (this.currentState !== State.BEGAN) {
      return;
    }

    this.tryEndFling();
  }

  public onPointerMove(event: IncomingEvent): void {
    this.pointerMoveAction(event);
    super.onPointerMove(event);
  }

  public onPointerOutOfBounds(event: IncomingEvent): void {
    this.pointerMoveAction(event);
    super.onPointerOutOfBounds(event);
  }

  public onPointerUp(event: IncomingEvent): void {
    super.onPointerUp(event);
    this.onUp(event);

    this.keyPointer = NaN;
  }

  public onAdditionalPointerRemove(event: IncomingEvent): void {
    super.onAdditionalPointerRemove(event);
    this.onUp(event);
  }

  private onUp(event: IncomingEvent): void {
    const logger = this.logger.cloneWithPrefix("onUp")
    logger.info("start")
    if (this.currentState === State.BEGAN) {
      this.endFling();
    }
    logger.info(`removeFromTracker: pointerId=${event.pointerId}`)
    this.tracker.removeFromTracker(event.pointerId);
  }

  public activate(): void {
    super.activate();
    this.end();
  }
}

function coneToDeviation(degrees: number) {
  return Math.cos(degToRad(degrees / 2));
}

function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180;
}