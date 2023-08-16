import { RNOHContext } from "rnoh/ts"

export class RNGHLogger {
  constructor(private rnohLogger: RNOHContext["logger"], private prefix: string) {
  }

  info(msg: string) {
    this.rnohLogger.info(`${this.prefix}::${msg}`)
  }

  cloneWithPrefix(prefix: string) {
    return new RNGHLogger(this.rnohLogger, `${this.prefix}::${prefix}`)
  }
}