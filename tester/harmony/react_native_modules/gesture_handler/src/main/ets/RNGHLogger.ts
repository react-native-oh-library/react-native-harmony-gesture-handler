import {RNOHContext} from '@rnoh/react-native-openharmony/ts';

export interface RNGHLogger {
  info(msg: string): void;

  cloneWithPrefix(prefix: string): RNGHLogger;

  debug(msg: string);

  error(msg: string);
}

export class StandardRNGHLogger implements RNGHLogger {
  constructor(
    private rnohLogger: RNOHContext['logger'],
    private prefix: string,
  ) {}

  error(msg: string) {
    this.rnohLogger.error(`${this.prefix}::${msg}`);
  }

  info(msg: string) {
    this.rnohLogger.info(`${this.prefix}::${msg}`);
  }

  debug(msg: string) {
    this.rnohLogger.debug(`${this.prefix}::${msg}`);
  }

  cloneWithPrefix(prefix: string) {
    return new StandardRNGHLogger(this.rnohLogger, `${this.prefix}::${prefix}`);
  }
}

export class FakeRNGHLogger implements RNGHLogger {
  info(msg: string) {}

  debug(msg: string) {}

  error(msg: string): void {}

  cloneWithPrefix(prefix: string) {
    return new FakeRNGHLogger();
  }
}
