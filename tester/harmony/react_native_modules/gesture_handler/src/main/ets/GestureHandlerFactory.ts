import { RNInstanceManager } from "rnoh/ts"
import { GestureHandlerOrchestrator } from './GestureHandlerOrchestrator';
import { GestureHandler, GestureHandlerDependencies } from "./GestureHandler"
import { TapGestureHandler } from './TapGestureHandler';
import { PointerTracker } from './PointerTracker';
import { RNGHError } from "./RNGHError"
import { EventDispatcher } from "./EventDispatcher"
import { InteractionManager } from './InteractionManager';

export class GestureHandlerFactory {
  private orchestrator = new GestureHandlerOrchestrator()
  private interactionManager = new InteractionManager()

  constructor(private rnInstanceManager: RNInstanceManager) {
  }

  create(handlerName: string, handlerTag: number): GestureHandler {
    const deps: GestureHandlerDependencies = {
      tracker: new PointerTracker(),
      orchestrator: this.orchestrator,
      handlerTag,
      eventDispatcher: new EventDispatcher(this.rnInstanceManager),
      interactionManager: this.interactionManager
    }
    switch (handlerName) {
      case "TapGestureHandler":
        return new TapGestureHandler(deps)
      default:
        throw new RNGHError(`Unknown handler type: ${handlerName}`)
    }
  }
}