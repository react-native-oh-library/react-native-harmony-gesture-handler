import { RNInstanceManager } from "rnoh/ts"
import { GestureHandlerOrchestrator } from './GestureHandlerOrchestrator';
import { GestureHandler, GestureHandlerDependencies } from "./GestureHandler"
import { TapGestureHandler } from './TapGestureHandler';
import { PointerTracker } from './PointerTracker';
import { RNGHError } from "./RNGHError"
import { EventDispatcher } from "./EventDispatcher"
import { InteractionManager } from './InteractionManager';
import { RNGHLogger } from './RNGHLogger';

export class GestureHandlerFactory {
  private orchestrator: GestureHandlerOrchestrator
  private interactionManager = new InteractionManager()
  private factoryLogger: RNGHLogger

  constructor(private rnInstanceManager: RNInstanceManager, private logger: RNGHLogger) {
    this.factoryLogger = logger.cloneWithPrefix("Factory")
    this.orchestrator = new GestureHandlerOrchestrator(logger.cloneWithPrefix("Orchestrator"))
  }

  create(handlerName: string, handlerTag: number): GestureHandler {
    this.factoryLogger.info(`create ${handlerName} with handlerTag: ${handlerTag}`)
    const deps: GestureHandlerDependencies = {
      tracker: new PointerTracker(),
      orchestrator: this.orchestrator,
      handlerTag,
      eventDispatcher: new EventDispatcher(this.rnInstanceManager, this.logger.cloneWithPrefix("EventDispatcher")),
      interactionManager: this.interactionManager,
      logger: this.logger.cloneWithPrefix("GestureHandler")
    }
    switch (handlerName) {
      case "TapGestureHandler":
        return new TapGestureHandler(deps)
      default:
        throw new RNGHError(`Unknown handler type: ${handlerName}`)
    }
  }
}