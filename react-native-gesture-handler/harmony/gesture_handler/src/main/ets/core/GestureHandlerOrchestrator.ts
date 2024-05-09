import { GestureHandler } from "./GestureHandler"
import { State, getStateName } from "./State"
import { PointerType } from "./IncomingEvent"
import { RNGHLogger } from "./RNGHLogger"

export class GestureHandlerOrchestrator {
  private awaitingHandlers: Set<GestureHandler> = new Set()
  private gestureHandlers: GestureHandler[] = []
  private handlersToCancel: GestureHandler[] = []
  private activationIndex: number = 0

  constructor(private logger: RNGHLogger) {
  }

  public onHandlerStateChange(handler: GestureHandler, newState: State, oldState: State, sendIfDisabled?: boolean) {
    const logger = this.logger.cloneWithPrefix(`onHandlerStateChange(handler=${handler.getTag()}, newState=${getStateName(newState)}, oldState=${getStateName(oldState)})`)
    logger.debug("start")

    if (!handler.isEnabled() && !sendIfDisabled) {
      return;
    }

    // this.handlingChangeSemaphore += 1;

    if (this.isFinishedState(newState)) {
      this.awaitingHandlers.forEach((otherHandler) => {
        if (otherHandler.shouldWaitFor(handler)) {
          if (newState === State.END) {
            otherHandler?.cancel();
            if (otherHandler.getState() === State.END) {
              // Handle edge case, where discrete gestures end immediately after activation thus
              // their state is set to END and when the gesture they are waiting for activates they
              // should be cancelled, however `cancel` was never sent as gestures were already in the END state.
              // Send synthetic BEGAN -> CANCELLED to properly handle JS logic
              otherHandler.sendEvent({ newState: State.CANCELLED, oldState: State.BEGAN });
            }
            otherHandler?.setAwaiting(false);
          } else {
            this.tryActivate(otherHandler);
          }
        }
      });
    }

    if (newState === State.ACTIVE) {
      this.tryActivate(handler);
    } else if (oldState === State.ACTIVE || oldState === State.END) {
      if (handler.isActive()) {
        handler.sendEvent({ newState, oldState });
      } else if (
        oldState === State.ACTIVE &&
          (newState === State.CANCELLED || newState === State.FAILED)
      ) {
        handler.sendEvent({ newState, oldState: State.BEGAN });
      }
    } else if (
      oldState !== State.UNDETERMINED ||
        newState !== State.CANCELLED
    ) {
      handler.sendEvent({ newState, oldState });
    }

    // this.handlingChangeSemaphore -= 1;

    this.cleanUpFinishedHandlers();
    if (!this.awaitingHandlers.has(handler)) {
      this.cleanupAwaitingHandlers(handler);
    }
  }

  private isFinishedState(state: State) {
    return [State.END, State.FAILED, State.CANCELLED].includes(state)
  }

  private tryActivate(handler: GestureHandler): void {
    const logger = this.logger.cloneWithPrefix(`tryActivate(${handler.getTag()})`)
    logger.debug({
      gestureHandlers: this.gestureHandlers.map(gh => gh.getTag()),
      awaitingHandlers: Array.from(this.awaitingHandlers).map(gh => gh.getTag()),
      handlersToCancel: this.handlersToCancel.map(gh => gh.getTag())
    })
    if (this.shouldBeCancelledByFinishedHandler(handler)) {
      logger.debug("failed to activate - cancelling")
      handler.cancel();
      return;
    }
    if (this.hasOtherHandlerToWaitFor(handler)) {
      this.addAwaitingHandler(handler);
      logger.debug("request ignored - has other handler waiting")
      return;
    }
    const handlerState = handler.getState();
    if (handlerState === State.CANCELLED || handlerState === State.FAILED) {
      logger.debug("request ignored - handler is in cancelled or failed state")
      return;
    }
    if (this.shouldActivate(handler)) {
      logger.debug("activating")
      this.makeActive(handler);
      return;
    }
    if (handlerState === State.ACTIVE) {
      logger.debug("failed to activate - handler is already active, marking as fail")
      handler.fail();
      return;
    }
    if (handlerState === State.BEGAN) {
      logger.debug("handler is in BEGAN state but shouldActivate returned false - cancelling")
      handler.cancel();
    }
  }

  private shouldBeCancelledByFinishedHandler(
    handler: GestureHandler
  ): boolean {
    const shouldBeCancelled = (otherHandler: GestureHandler) => {
      return (
        handler.shouldWaitFor(otherHandler) &&
          otherHandler.getState() === State.END
      );
    };
    return this.gestureHandlers.some(shouldBeCancelled);
  }

  private hasOtherHandlerToWaitFor(handler: GestureHandler): boolean {
    const logger = this.logger.cloneWithPrefix(`hasOtherHandlerToWaitFor(handler=${handler.getTag()})`)
    for (const otherHandler of this.gestureHandlers) {
      if (otherHandler === handler) {
        return false
      }
      if (!this.isFinishedState(otherHandler.getState()) && handler.shouldWaitFor(otherHandler)) {
        logger.debug("true")
        return true
      }
    }
    logger.debug("false")
    return false;
  }

  private addAwaitingHandler(handler: GestureHandler) {
    const logger = this.logger.cloneWithPrefix(`addAwaitingHandler(handlerTag=${handler.getTag()})`)
    logger.debug({ awaitingHandlers: this.awaitingHandlers })
    if (!this.awaitingHandlers.has(handler)) {
      this.awaitingHandlers.add(handler)
      handler.setAwaiting(true)
      handler.setActivationIndex(this.activationIndex++)
    }
  }

  private shouldActivate(handler: GestureHandler) {
    for (const otherHandler of this.gestureHandlers) {
      if (this.shouldHandlerBeCancelledByOtherHandler({ handler, otherHandler })) {
        return false
      }
    }
    return true
  }

  private shouldHandlerBeCancelledByOtherHandler({handler, otherHandler}: {
    handler: GestureHandler,
    otherHandler: GestureHandler
  }): boolean {
    const logger = this.logger.cloneWithPrefix(`shouldHandlerBeCancelledByOtherHandler(${handler.getTag()}, ${otherHandler.getTag()})`)
    if (this.canRunSimultaneously(handler, otherHandler)) {
      logger.debug("false")
      return false;
    }
    if (handler !== otherHandler && (handler.isAwaiting() || handler.getState() === State.ACTIVE)) {
      const result = handler.shouldBeCancelledByOther(otherHandler)
      logger.debug(`${result} (1)`)
      return result
    }
    const result = this.checkOverlap(handler, otherHandler)
    logger.debug(`${result} (2)`)
    return result;
  }

  private canRunSimultaneously(handlerA: GestureHandler, handlerB: GestureHandler) {
    const logger = this.logger.cloneWithPrefix("canRunSimultaneously")
    const result = handlerA === handlerB
      || handlerA.shouldRecognizeSimultaneously(handlerB)
      || handlerB.shouldRecognizeSimultaneously(handlerA)

    logger.debug({ result, handlerA: handlerA.getTag(), handlerB: handlerB.getTag() })
    return result
  }

  private checkOverlap(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    // If handlers don't have common pointers, default return value is false.
    // However, if at least on pointer overlaps with both handlers, we return true
    // This solves issue in overlapping parents example

    // TODO: Find better way to handle that issue, for example by activation order and handler cancelling

    const handlerPointers: number[] = handler.getTrackedPointersID();
    const otherPointers: number[] = otherHandler.getTrackedPointersID();
    let overlap = false;
    handlerPointers.forEach((pointer: number) => {
      const handlerX: number = handler.getTracker().getLastX(pointer);
      const handlerY: number = handler.getTracker().getLastY(pointer);
      if (
        handler.getView().isPositionInBounds({ x: handlerX, y: handlerY }) &&
        otherHandler.getView().isPositionInBounds({ x: handlerX, y: handlerY })
      ) {
        overlap = true;
      }
    });
    otherPointers.forEach((pointer: number) => {
      const otherX: number = otherHandler.getTracker().getLastX(pointer);
      const otherY: number = otherHandler.getTracker().getLastY(pointer);
      if (
        handler.getView().isPositionInBounds({ x: otherX, y: otherY }) &&
        otherHandler.getView().isPositionInBounds({ x: otherX, y: otherY })
      ) {
        overlap = true;
      }
    });
    return overlap;
  }

  private makeActive(handler: GestureHandler): void {
    handler.setActive(true)
    handler.setShouldResetProgress(true)
    handler.setActivationIndex(this.activationIndex++)
    for (const otherHandler of this.gestureHandlers) {
      if (this.shouldHandlerBeCancelledByOtherHandler({ handler: otherHandler, otherHandler: handler })) {
        this.handlersToCancel.push(otherHandler)
      }
    }
    for (let i = this.handlersToCancel.length - 1; i >= 0; --i) {
      this.handlersToCancel[i]?.cancel();
    }
    this.handlersToCancel = []
    for (const awaitingHandler of this.awaitingHandlers) {
      if (this.shouldHandlerBeCancelledByOtherHandler({ handler: awaitingHandler, otherHandler: handler })) {
        awaitingHandler.cancel();
        awaitingHandler.setAwaiting(true);
      }
    }
    const currentState = handler.getState()
    handler.sendEvent({ newState: State.ACTIVE, oldState: State.BEGAN })
    if (currentState !== State.ACTIVE) {
      handler.sendEvent({ newState: State.END, oldState: State.ACTIVE })
      if (currentState !== State.END) {
        handler.sendEvent({ newState: State.UNDETERMINED, oldState: State.END })
      }
    }
    if (handler.isAwaiting()) {
      handler.setAwaiting(false)
      this.awaitingHandlers.delete(handler)
    }
  }

  private cleanUpHandlers(handler: GestureHandler) {
    this.cleanUpFinishedHandlers()
    if (this.awaitingHandlers.has(handler)) {
      this.cleanupAwaitingHandlers(handler);
    }
  }

  private cleanUpFinishedHandlers(): void {
    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      const handler = this.gestureHandlers[i];
      if (!handler) {
        continue;
      }
      if (this.isFinishedState(handler.getState()) && !handler.isAwaiting()) {
        this.gestureHandlers.splice(i, 1);
        this.cleanUpHandler(handler);
      }
    }
  }

  private cleanupAwaitingHandlers(handler: GestureHandler): void {
    const logger = this.logger.cloneWithPrefix(`cleanupAwaitingHandlers(handler=${handler.getTag()})`)
    logger.debug({ awaitingHandlers: this.awaitingHandlers })
    for (const awaitingHandler of this.awaitingHandlers) {
      if (
        awaitingHandler.isAwaiting() &&
        awaitingHandler.shouldWaitFor(handler)
      ) {
        this.cleanUpHandler(awaitingHandler);
        this.awaitingHandlers.delete(awaitingHandler)
      }
    }
  }

  private cleanUpHandler(handler: GestureHandler) {
    handler.reset();
    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_VALUE);
  }

  public registerHandlerIfNotPresent(handler: GestureHandler) {
    this.logger.info(`registerHandlerIfNotPresent(${handler.getTag()})`)
    if (this.gestureHandlers.includes(handler)) return;
    this.gestureHandlers.push(handler);
    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_SAFE_INTEGER);
  }

  /**
   This function is called when handler receives touchdown event
   If handler is using mouse or pen as a pointer and any handler receives touch event,
   mouse/pen event disappears - it doesn't send onPointerCancel nor onPointerUp (and others)
   This became a problem because handler was left at active state without any signal to end or fail
   To handle this, when new touch event is received, we loop through active handlers and check which type of
   pointer they're using. If there are any handler with mouse/pen as a pointer, we cancel them
   */
  public cancelMouseAndPenGestures(currentHandler: GestureHandler): void {
    this.logger.info("cancelMouseAndPenGestures")
    this.gestureHandlers.forEach((handler: GestureHandler) => {
      if (handler.getPointerType() !== PointerType.MOUSE && handler.getPointerType() !== PointerType.PEN) return;

      if (handler !== currentHandler) {
        handler.cancel();
      } else {
        // Handler that received touch event should have its pointer tracker reset
        // This allows handler to smoothly change from mouse/pen to touch
        // The drawback is, that when we try to use mouse/pen one more time, it doesn't send onPointerDown at the first time
        // so it is required to click two times to get handler to work
        //
        // However, handler will receive manually created onPointerEnter that is triggered in EventManager in onPointerMove method.
        // There may be possibility to use that fact to make handler respond properly to first mouse click
        handler.getTracker().resetTracker();
      }
    });
  }
}

