import { GestureHandlerOrchestrator } from './GestureHandlerOrchestrator';
import { GestureHandler, GestureHandlerDependencies } from "./GestureHandler"
import { TapGestureHandler } from './TapGestureHandler';
import { PointerTracker } from './PointerTracker';
import { RNGHError } from "./RNGHError"

export class GestureHandlerFactory {
  constructor(private orchestrator: GestureHandlerOrchestrator) {
  }

  create(handlerName: string, handlerTag: number): GestureHandler {
    const deps: GestureHandlerDependencies = {
      tracker: new PointerTracker(),
      orchestrator: this.orchestrator,
      handlerTag
    }
    switch(handlerName) {
      case "TapGestureHandler": return new TapGestureHandler(deps)
      default: throw new RNGHError(`Unknown handler type: ${handlerName}`)
    }
  }
}