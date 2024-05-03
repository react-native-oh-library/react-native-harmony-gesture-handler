import { RNOHContext } from '@rnoh/react-native-openharmony/ts';
import { RNGHLogger, RNGHLoggerMessage } from "../core"

export class StandardRNGHLogger implements RNGHLogger {
  constructor(
    private rnohLogger: RNOHContext['logger'],
    private prefix: string,
  ) {
  }

  error(msg: string) {
    this.rnohLogger.error(`${this.prefix}::${msg}`);
  }

  info(msg: string) {
    this.rnohLogger.info(`${this.prefix}::${msg}`);
  }

  debug(msg: RNGHLoggerMessage) {
    this.rnohLogger.debug(`${this.prefix}::${this.stringifyMsg(msg)}`);
  }

  private stringifyMsg(msg: RNGHLoggerMessage): string {
    if (typeof msg === "string") {
      return msg
    } else {
      return JSON.stringify(msg)
    }
  }

  cloneWithPrefix(prefix: string) {
    return new StandardRNGHLogger(this.rnohLogger, `${this.prefix}::${prefix}`);
  }
}

export class FakeRNGHLogger implements RNGHLogger {
  info(msg: string) {
  }

  debug(msg: string) {
  }

  error(msg: string): void {
  }

  cloneWithPrefix(prefix: string) {
    return new FakeRNGHLogger();
  }
}
