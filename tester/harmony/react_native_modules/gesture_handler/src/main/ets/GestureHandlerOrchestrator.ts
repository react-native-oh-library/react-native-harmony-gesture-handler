import { GestureHandler } from "./GestureHandler"
import { State } from "./State"


interface OverlapChecker {
  checkOverlap(handlerA: GestureHandler, handlerB: GestureHandler)
}

interface GestureHandlerOrchestratorProtocol {
  onHandlerStateChange(handler: GestureHandler, newState: State, oldState: State, sendIfDisabled?: boolean): void

  // recordHandlerIfNotPresent(handler: GestureHandler): void

  // cancelMouseAndPanGestures(currentHandler: GestureHandler): void

  // removeHandler(handler: GestureHandler): void
}


export class GestureHandlerOrchestrator implements GestureHandlerOrchestratorProtocol {
  private awaitingHandlers: Set<GestureHandler>
  private gestureHandlers: GestureHandler[]
  private handlersToCancel: GestureHandler[]
  private activationIndex: number = 0

  constructor(private overlapChecker: OverlapChecker) {
  }

  public onHandlerStateChange(handler: GestureHandler, newState: State, oldState: State, sendIfDisabled?: boolean) {
    if (this.shouldCancelStateChange(handler, sendIfDisabled)) return;
    if (this.isFinishedState(newState)) {
      this.handleChangingToFinishedState(handler, newState)
    }
    if (newState === State.ACTIVE) {
      this.tryActivate(handler)
    } else if (oldState === State.ACTIVE || oldState === State.END) {
      if (handler.isActive()) {
        handler.sendEvent({ newState, oldState })
      } else if (oldState === State.ACTIVE && (newState === State.CANCELLED || newState === State.FAILED)) {
        // Handle edge case where handler awaiting for another one tries to activate but finishes
        // before the other would not send state change event upon ending. Note that we only want
        // to do this if the newState is either CANCELLED or FAILED, if it is END we still want to
        // wait for the other handler to finish as in that case synthetic events will be sent by the
        // makeActive method.
        handler.sendEvent({ newState, oldState: State.BEGAN })
      }
    } else if (newState !== State.CANCELLED || oldState !== State.UNDETERMINED) {
      // If handler is changing state from UNDETERMINED to CANCELLED, the state change event shouldn't
      // be sent. Handler hasn't yet began so it may not be initialized which results in crashes.
      // If it doesn't crash, there may be some weird behavior on JS side, as `onFinalize` will be
      // called without calling `onBegin` first.
      handler.sendEvent({ newState, oldState })
    }
    this.cleanUpHandlers(handler)
  }

  private isFinishedState(state: State) {
    return [State.END, State.FAILED, State.CANCELLED].includes(state)
  }

  private shouldCancelStateChange(handler: GestureHandler, sendIfDisabled?: boolean) {
    const isHandlerDisabled = !handler.isEnabled()
    return!sendIfDisabled && isHandlerDisabled
  }

  private handleChangingToFinishedState(handler: GestureHandler, newState: State) {
    this.awaitingHandlers.forEach(awaitingHandler => {
      if (handler.shouldWaitFor(awaitingHandler)) {
        if (newState === State.END) {
          awaitingHandler.cancel()
          if (awaitingHandler.getState() === State.END) {
            // Handle edge case, where discrete gestures end immediately after activation thus
            // their state is set to END and when the gesture they are waiting for activates they
            // should be cancelled, however `cancel` was never sent as gestures were already in the END state.
            // Send synthetic BEGAN -> CANCELLED to properly handle JS logic
            awaitingHandler.sendEvent({ newState: State.CANCELLED, oldState: State.BEGAN })
          }
          awaitingHandler.setAwaiting(false)
        } else {
          this.tryActivate(awaitingHandler)
        }
      }
    })
  }

  private tryActivate(handler: GestureHandler): void {
    if (this.hasOtherHandlerToWaitFor(handler)) {
      this.addAwaitingHandler(handler)
    } else if (handler.getState() !== State.CANCELLED && handler.getState() !== State.FAILED) {
      if (this.shouldActivate(handler)) {
        this.makeActive(handler);
      } else {
        switch (handler.getState()) {
          case State.ACTIVE:
            handler.fail();
            break;
          case State.BEGAN:
            handler.cancel();
            break;
        }
      }
    }
  }

  private hasOtherHandlerToWaitFor(handler: GestureHandler): boolean {
    for (const otherHandler of this.gestureHandlers) {
      if (!this.isFinishedState(otherHandler.getState()) && otherHandler.shouldWaitFor(handler)) {
        return true
      }
    }
    return false;
  }

  private addAwaitingHandler(handler: GestureHandler) {
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
    if (this.canRunSimultaneously(handler, otherHandler))
      return false;
    if (handler !== otherHandler && (handler.isAwaiting() || handler.getState() === State.ACTIVE))
      return handler.shouldBeCancelledByOther(otherHandler)
    return this.overlapChecker.checkOverlap(handler, otherHandler)
  }

  private canRunSimultaneously(handlerA: GestureHandler, handlerB: GestureHandler) {
    return handlerA === handlerB
      || handlerA.shouldRecognizeSimultaneously(handlerB)
      || handlerB.shouldRecognizeSimultaneously(handlerA)
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
}

