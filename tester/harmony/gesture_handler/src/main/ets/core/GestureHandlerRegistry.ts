import { GestureHandler } from "./GestureHandler"
import { View } from "./View"
import { RNGHLogger } from "./RNGHLogger"
import { ViewRegistry } from "./ViewRegistry"

export class GestureHandlerRegistry {
  private gestureHandlerByHandlerTag: Map<number, GestureHandler> = new Map()
  private gestureHandlersByViewTag: Map<number, Set<GestureHandler>> = new Map()
  private viewRegistry: ViewRegistry | undefined
  private logger: RNGHLogger

  constructor(viewRegistry: ViewRegistry | undefined, logger: RNGHLogger) {
    this.logger = logger.cloneWithPrefix("GestureHandlerRegistry")
    this.viewRegistry = viewRegistry
  }

  public addGestureHandler(gestureHandler: GestureHandler) {
    this.gestureHandlerByHandlerTag.set(gestureHandler.getTag(), gestureHandler)
  }

  public bindGestureHandlerWithView(gestureHandlerTag: number, view: View) {
    this.logger.cloneWithPrefix("bindGestureHandlerWithView").debug({gestureHandlerTag, viewTag: view.getTag()})
    const viewTag = view.getTag()
    if (!this.gestureHandlersByViewTag.has(viewTag))
      this.gestureHandlersByViewTag.set(viewTag, new Set())
    const gestureHandler = this.gestureHandlerByHandlerTag.get(gestureHandlerTag)
    this.gestureHandlersByViewTag.get(viewTag).add(gestureHandler)
    gestureHandler.onViewAttached(view)
  }

  public getGestureHandlersByViewTag(viewTag: number): GestureHandler[] {
    return Array.from(this.gestureHandlersByViewTag.get(viewTag) ?? [])
  }

  public removeGestureHandlerByHandlerTag(handlerTag: number) {
    const gestureHandler = this.gestureHandlerByHandlerTag.get(handlerTag)
    if (!gestureHandler) {
      return;
    }
    const viewTag = gestureHandler.getView()?.getTag();
    if (viewTag) {
      const gestureHandlers = this.gestureHandlersByViewTag.get(viewTag)
      if (gestureHandlers) {
        gestureHandlers.delete(gestureHandler)
        if (gestureHandlers.size === 0) {
          this.gestureHandlersByViewTag.delete(viewTag)
          this.viewRegistry?.deleteByTag(viewTag)
        }
      }
    }
    if (gestureHandler.getView()) {
      // Handler is in "prepared" state which means it is registered in the orchestrator and can
      // receive touch events. This means that before we remove it from the registry we need to
      // "cancel" it so that orchestrator does no longer keep a reference to it.
      gestureHandler.cancel()
    }
    this.gestureHandlerByHandlerTag.delete(handlerTag)
  }

  public getGestureHandlerByHandlerTag(handlerTag: number): GestureHandler {
    return this.gestureHandlerByHandlerTag.get(handlerTag)
  }
}