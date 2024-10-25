import { RNOHContext } from '@rnoh/react-native-openharmony/ts';
import { RNGHLogger, RNGHLoggerMessage } from "../core"
import hiTrace from "@ohos.hiTraceMeter"

class Tracer {
  private activeTracesCount: number = 0

  public startTrace(name: string) {
    /**
     * hiTrace.startTrace creates a new lane which makes the traces useless
     */
    hiTrace.startTrace(name, 0)
    this.activeTracesCount++
    return () => {
      hiTrace.finishTrace(name, 0)
      this.activeTracesCount--
    }
  }

  public getActiveTracesCount(): number {
    return this.activeTracesCount
  }
}

export class DevelopmentRNGHLogger implements RNGHLogger {
  constructor(
    protected rnohLogger: RNOHContext['logger'],
    protected prefix: string,
    protected tracer: Tracer = new Tracer(),
  ) {
  }

  error(msg: string) {
    this.log("error", msg);
  }

  warn(msg: string) {
    this.log("warn", msg);
  }

  info(msg: string) {
    this.log("info", msg);
  }

  debug(msg: RNGHLoggerMessage) {
    this.log("debug", typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  protected log(type: "debug" | "info" | "warn" | "error", msg: string, offset: number | undefined = undefined) {
    this.rnohLogger[type](" ".repeat(offset ?? this.tracer.getActiveTracesCount() * 2),
      `${this.prefix}: ${this.stringifyMsg(msg)}`)
  }

  startTracing(): () => void {
    const startTime = Date.now()
    const currentOffset = this.tracer.getActiveTracesCount() * 2
    this.log("debug", "START", currentOffset)
    const stopTrace = this.tracer.startTrace(this.prefix)
    return () => {
      stopTrace()
      const stopTime = Date.now()
      const durationInMs = stopTime - startTime
      if (durationInMs < 16) {
        this.log("debug", "STOP", currentOffset)
      } else {
        this.log("debug", `STOP (${durationInMs} ms)`, currentOffset)
      }
    }
  }

  private stringifyMsg(msg: RNGHLoggerMessage): string {
    if (typeof msg === "string") {
      return msg
    } else {
      return JSON.stringify(msg)
    }
  }

  cloneAndJoinPrefix(prefix: string) {
    return new DevelopmentRNGHLogger(this.rnohLogger, `${this.prefix}::${prefix}`, this.tracer);
  }
}

export class ProductionRNGHLogger extends DevelopmentRNGHLogger {
  override debug(msg: string) {
    // NOOP
  }

  override cloneAndJoinPrefix(prefix: string) {
    return new ProductionRNGHLogger(this.rnohLogger, `${this.prefix}::${prefix}`, this.tracer);
  }

  override startTracing(): () => void {
    const startTime = Date.now()
    const currentOffset = this.tracer.getActiveTracesCount() * 2

    const stopTrace = this.tracer.startTrace(this.prefix)
    return () => {
      stopTrace()
      const stopTime = Date.now()
      const durationInMs = stopTime - startTime
      if (durationInMs > 16) {
        this.log("warn", `STOP (${durationInMs} ms)`, currentOffset)
      }
    }
  }
}