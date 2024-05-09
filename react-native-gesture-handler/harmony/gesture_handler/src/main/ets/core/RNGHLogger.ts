export type RNGHLoggerMessage = string | Object

export interface RNGHLogger {
  info(msg: string): void;

  cloneWithPrefix(prefix: string): RNGHLogger;

  debug(msg: RNGHLoggerMessage);

  error(msg: string);
}

