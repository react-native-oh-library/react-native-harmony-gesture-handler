import {
  RNGHLogger,
  InteractionManager,
  RNGHError,
  PointerTracker,
  GestureHandler,
  GestureHandlerDependencies,
  ScrollLocker,
  GestureHandlerOrchestrator,
  RNGestureResponder
} from "../core"
import { TapGestureHandler } from './TapGestureHandler';
import { PanGestureHandler } from "./PanGestureHandler"
import { PinchGestureHandler } from "./PinchGestureHandler"
import { NativeViewGestureHandler } from "./NativeViewGestureHandler"
import { ManualGestureHandler } from './ManualGestureHandler';
import { LongPressGestureHandler } from "./LongPressGestureHandler"
import { FlingGestureHandler } from "./FlingGestureHandler"
import { RotationGestureHandler } from "./RotationGestureHandler"

export class GestureHandlerFactory {
  private orchestrator: GestureHandlerOrchestrator
  private logger: RNGHLogger

  constructor(private cleanLogger: RNGHLogger, private scrollLocker: ScrollLocker, private interactionManager: InteractionManager, private rnGestureResponder: RNGestureResponder) {
    this.logger = cleanLogger.cloneWithPrefix("Factory")
    this.orchestrator = new GestureHandlerOrchestrator(cleanLogger.cloneWithPrefix("Orchestrator"))
  }

  create(handlerName: string, handlerTag: number): GestureHandler {
    this.logger.info(`create ${handlerName} with handlerTag: ${handlerTag}`)
    const deps: GestureHandlerDependencies = {
      tracker: new PointerTracker(),
      orchestrator: this.orchestrator,
      handlerTag,
      interactionManager: this.interactionManager,
      logger: this.cleanLogger.cloneWithPrefix("GestureHandler"),
      scrollLocker: this.scrollLocker,
      rnGestureResponder: this.rnGestureResponder,
    }
    switch (handlerName) {
      case "TapGestureHandler":
        return new TapGestureHandler(deps)
      case "PanGestureHandler":
        return new PanGestureHandler(deps)
      case "PinchGestureHandler":
        return new PinchGestureHandler(deps)
      case "NativeViewGestureHandler":
        return new NativeViewGestureHandler(deps)
      case "ManualGestureHandler":
        return new ManualGestureHandler(deps)
      case "LongPressGestureHandler":
        return new LongPressGestureHandler(deps)
      case "FlingGestureHandler":
        return new FlingGestureHandler(deps)
      case "RotationGestureHandler":
        return new RotationGestureHandler(deps)
      default:
        const msg = `Unknown handler type: ${handlerName}`
        this.logger.info(msg)
        throw new RNGHError(msg)
    }
  }
}