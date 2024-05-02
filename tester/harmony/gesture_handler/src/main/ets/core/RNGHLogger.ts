export interface RNGHLogger {
  info(msg: string): void;

  cloneWithPrefix(prefix: string): RNGHLogger;

  debug(msg: string | Object);

  error(msg: string);
}

