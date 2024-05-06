import { GestureHandler, Handler, GestureConfig as Config, GHTag } from "./GestureHandler"
import { RNGHLogger } from "./RNGHLogger"

export class InteractionManager {
  private readonly waitForRelations: Map<GHTag, Set<GHTag>> = new Map()
  private readonly simultaneousRelations: Map<GHTag, GHTag[]> = new Map()
  private readonly blocksHandlersRelations: Map<GHTag, GHTag[]> = new Map();

  private logger: RNGHLogger

  constructor(logger: RNGHLogger) {
    this.logger = logger.cloneWithPrefix("InteractionManager")
  }

  public configureInteractions(handler: GestureHandler, config: Config) {
    this.dropRelationsForHandlerWithTag(handler.getTag());

    if (config.waitFor) {
      const waitFor = new Set<GHTag>();
      config.waitFor.forEach((otherHandler: Handler): void => {
        // New API reference
        if (typeof otherHandler === 'number') {
          waitFor.add(otherHandler);
        } else {
          // Old API reference
          waitFor.add(otherHandler.handlerTag);
        }
      });

      this.waitForRelations.set(handler.getTag(), waitFor);
    }

    if (config.simultaneousHandlers) {
      const simultaneousHandlers: number[] = [];
      config.simultaneousHandlers.forEach((otherHandler: Handler): void => {
        if (typeof otherHandler === 'number') {
          simultaneousHandlers.push(otherHandler);
        } else {
          simultaneousHandlers.push(otherHandler.handlerTag);
        }
      });

      this.simultaneousRelations.set(handler.getTag(), simultaneousHandlers);
    }

     if (config.blocksHandlers) {
       const blocksHandlers: number[] = [];
       config.blocksHandlers.forEach((otherHandler: Handler): void => {
         if (typeof otherHandler === 'number') {
           blocksHandlers.push(otherHandler);
         } else {
           blocksHandlers.push(otherHandler.handlerTag);
         }
       });
       this.blocksHandlersRelations.set(handler.getTag(), blocksHandlers);
     }
  }

  public shouldWaitForHandlerFailure(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    const logger = this.logger.cloneWithPrefix(`shouldWaitForHandlerFailure(${handler.getTag()}, ${otherHandler.getTag()})`)
    const waitFor = this.waitForRelations.get(
      handler.getTag()
    );
    logger.debug({waitFor: Array.from(waitFor ?? [])})
    if (!waitFor) {
      logger.debug("false")
      return false;
    }

    let shouldWait = false;
    waitFor.forEach((tag: number): void => {
      if (tag === otherHandler.getTag()) {
        shouldWait = true;
        return; //Returns from callback
      }
    });
    logger.debug(shouldWait)
    return shouldWait;
  }

  public shouldRecognizeSimultaneously(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    const logger = this.logger.cloneWithPrefix(`shouldRecognizeSimultaneously(${handler.getTag()}, ${otherHandler.getTag()})`)
    const simultaneousHandlers: number[] | undefined =
      this.simultaneousRelations.get(handler.getTag());
    if (!simultaneousHandlers) {
      logger.debug(`false - Handler ${handler.getTag()} doesn't have simultaneousRelations specified`)
      return false;
    }
    let shouldRecognizeSimultaneously = false;
    simultaneousHandlers.forEach((tag: number): void => {
      if (tag === otherHandler.getTag()) {
        shouldRecognizeSimultaneously = true;
        return;
      }
    });
    logger.debug(`${shouldRecognizeSimultaneously} ${JSON.stringify({ simultaneousHandlers })}`)
    return shouldRecognizeSimultaneously;
  }

  public shouldRequireHandlerToWaitForFailure(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    const waitFor: number[] | undefined = this.blocksHandlersRelations.get(
      handler.getTag()
    );

    return (
      waitFor?.find((tag: number) => {
        return tag === otherHandler.getTag();
      }) !== undefined
    );
  }

  public shouldHandlerBeCancelledBy(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    const logger = this.logger.cloneWithPrefix(`shouldHandlerBeCancelledBy(handler=${handler.getTag()}, otherHandler=${otherHandler.getTag()})`)
    // We check constructor name instead of using `instanceof` in order do avoid circular dependencies
    // const isNativeHandler =
    //   otherHandler.constructor.name === 'NativeViewGestureHandler';
    // const isActive = otherHandler.getState() === State.ACTIVE;
    // const isButton = otherHandler.isButton?.() === true;
    // return isNativeHandler && isActive && !isButton;
    return false
  }

  public dropRelationsForHandlerWithTag(handlerTag: number): void {
    this.waitForRelations.delete(handlerTag);
    this.simultaneousRelations.delete(handlerTag);
  }

  public reset() {
    this.waitForRelations.clear();
    this.simultaneousRelations.clear();
  }
}