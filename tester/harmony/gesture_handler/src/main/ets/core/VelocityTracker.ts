import { IncomingEvent } from './IncomingEvent';
import { CircularBuffer } from './CircularBuffer';
import { LeastSquareSolver } from './LeastSquareSolver';
import { RNGHLogger } from "./RNGHLogger"

export interface TrackerElement {
  lastX: number;
  lastY: number;
  timeStamp: number;
  velocityX: number;
  velocityY: number;
}

export class VelocityTracker {
  private assumePointerMoveStoppedMilliseconds = 40;
  private historySize = 10;
  private horizonMilliseconds = 300;
  private minSampleSize = 3;

  private samples: CircularBuffer<IncomingEvent>;

  private logger: RNGHLogger

  constructor(logger: RNGHLogger) {
    this.logger = logger.cloneAndJoinPrefix("VelocityTracker")
    this.samples = new CircularBuffer<IncomingEvent>(this.historySize);
  }

  public add(event: IncomingEvent): void {
    this.samples.push(event);
  }

  /// Returns an estimate of the velocity of the object being tracked by the
  /// tracker given the current information available to the tracker.
  ///
  /// Information is added using [addPosition].
  ///
  /// Returns null if there is no data on which to base an estimate.
  private getVelocityEstimate(): [number, number] | null {
    const logger = this.logger.cloneAndJoinPrefix("getVelocityEstimate")
    const stopTracing = logger.startTracing()
    const result: [number, number] | null = (() => {
      const x = [];
      const y = [];
      const w = [];
      const time = [];

      let sampleCount = 0;
      let index = this.samples.size - 1;
      const newestSample = this.samples.get(index);
      if (!newestSample) {
        return null;
      }

      let previousSample = newestSample;

      // Starting with the most recent PointAtTime sample, iterate backwards while
      // the samples represent continuous motion.
      const stopTracingLoop = logger.cloneAndJoinPrefix("loop").startTracing()
      while (sampleCount < this.samples.size) {
        const sample = this.samples.get(index);

        const age = newestSample.time - sample.time;
        const delta = Math.abs(sample.time - previousSample.time);
        previousSample = sample;

        if (
          age > this.horizonMilliseconds ||
            delta > this.assumePointerMoveStoppedMilliseconds
        ) {
          break;
        }

        x.push(sample.x);
        y.push(sample.y);
        w.push(1);
        time.push(-age);

        sampleCount++;
        index--;
      }
      stopTracingLoop()
      const stopTracingSolver = logger.cloneAndJoinPrefix(`solver (sampleCount=${sampleCount})`).startTracing()
      if (sampleCount >= this.minSampleSize) {
        // this section is slow
        const xSolver = new LeastSquareSolver(time, x, w);
        const xFit = xSolver.solve(2);

        if (xFit !== null) {
          const ySolver = new LeastSquareSolver(time, y, w);
          const yFit = ySolver.solve(2);

          if (yFit !== null) {
            const xVelocity = xFit.coefficients[1] * 1000;
            const yVelocity = yFit.coefficients[1] * 1000;
            stopTracingSolver();
            return [xVelocity, yVelocity];
          }
        }
      }
      stopTracingSolver()
      return null;
    })();
    stopTracing();
    return result;
  }

  public getVelocity(): [number, number] {
    const stopTracing = this.logger.cloneAndJoinPrefix("getVelocity").startTracing();
    const result: [number, number] = (() => {
      const estimate = this.getVelocityEstimate();
      if (estimate !== null) {
        return estimate;
      }
      return [0, 0];
    })();
    stopTracing()
    return result;
  }

  public reset(): void {
    this.samples.clear();
  }
}
