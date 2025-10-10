export type RNGHLoggerMessage = string | Object

export interface RNGHLogger {
  cloneAndJoinPrefix(prefix: string): RNGHLogger;

  debug(msg: RNGHLoggerMessage);

  info(msg: string): void;

  warn(warn: string);

  error(msg: string);

  startTracing(): () => void
}

