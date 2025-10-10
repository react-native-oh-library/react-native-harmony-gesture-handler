import {GestureHandler} from './GestureHandler';
import {getStateName, State} from './State';
import {PointerType} from './IncomingEvent';
import {RNGHLogger} from './RNGHLogger';
import {PointerTracker} from './PointerTracker';

export class GestureHandlerOrchestrator {
  private gestureHandlers: GestureHandler[] = [];
  private awaitingHandlers: GestureHandler[] = [];
  private awaitingHandlersTags: Set<number> = new Set();

  private handlingChangeSemaphore = 0;
  private activationIndex = 0;

  private logger: RNGHLogger;

  constructor(logger: RNGHLogger) {
    this.logger = logger.cloneAndJoinPrefix('GestureHandlerOrchestrator');
  }

  public onHandlerStateChange(
    handler: GestureHandler,
    newState: State,
    oldState: State,
    sendIfDisabled?: boolean,
  ): void {
    const logger = this.logger.cloneAndJoinPrefix(
      `onHandlerStateChange(handler=${handler.getTag()}, newState=${getStateName(
        newState,
      )}, oldState=${getStateName(oldState)})`,
    );
    logger.debug('start');

    if (!handler.isEnabled() && !sendIfDisabled) {
      return;
    }

    this.handlingChangeSemaphore += 1;

    if (this.isFinished(newState)) {
      for (const otherHandler of this.awaitingHandlers) {
        if (
          !this.shouldHandlerWaitForOther(otherHandler, handler) ||
          !this.awaitingHandlersTags.has(otherHandler.getTag())
        ) {
          continue;
        }

        if (newState !== State.END) {
          this.tryActivate(otherHandler);
          continue;
        }

        otherHandler.cancel();

        if (otherHandler.getState() === State.END) {
          // Handle edge case, where discrete gestures end immediately after activation thus
          // their state is set to END and when the gesture they are waiting for activates they
          // should be cancelled, however `cancel` was never sent as gestures were already in the END state.
          // Send synthetic BEGAN -> CANCELLED to properly handle JS logic
          otherHandler.sendEvent({
            newState: State.CANCELLED,
            oldState: State.BEGAN,
          });
        }

        otherHandler.setAwaiting(false);
      }
    }

    if (newState === State.ACTIVE) {
      this.tryActivate(handler);
    } else if (oldState === State.ACTIVE || oldState === State.END) {
      if (handler.isActive()) {
        handler.sendEvent({newState, oldState});
      } else if (
        oldState === State.ACTIVE &&
        (newState === State.CANCELLED || newState === State.FAILED)
      ) {
        handler.sendEvent({newState, oldState: State.BEGAN});
      }
    } else if (
      oldState !== State.UNDETERMINED ||
      newState !== State.CANCELLED
    ) {
      handler.sendEvent({newState, oldState});
    }

    this.handlingChangeSemaphore -= 1;

    this.scheduleFinishedHandlersCleanup();

    if (!this.awaitingHandlers.includes(handler)) {
      this.cleanupAwaitingHandlers(handler);
    }
  }

  private isFinished(state: State): boolean {
    return (
      state === State.END || state === State.FAILED || state === State.CANCELLED
    );
  }

  private tryActivate(handler: GestureHandler): void {
    const logger = this.logger.cloneAndJoinPrefix(
      `tryActivate(${handler.getTag()})`,
    );
    logger.debug({
      gestureHandlers: this.gestureHandlers.map(gh => gh.getTag()),
      awaitingHandlers: Array.from(this.awaitingHandlers).map(gh =>
        gh.getTag(),
      ),
    });

    if (this.shouldBeCancelledByFinishedHandler(handler)) {
      logger.debug('failed to activate - cancelling');
      handler.cancel();
      return;
    }

    if (this.hasOtherHandlerToWaitFor(handler)) {
      this.addAwaitingHandler(handler);
      logger.debug('request ignored - has other handler waiting');
      return;
    }

    const handlerState = handler.getState();

    if (handlerState === State.CANCELLED || handlerState === State.FAILED) {
      logger.debug('request ignored - handler is in cancelled or failed state');
      return;
    }

    if (this.shouldActivate(handler)) {
      logger.debug('activating');
      this.makeActive(handler);
      return;
    }

    if (handlerState === State.ACTIVE) {
      logger.debug(
        'failed to activate - handler is already active, marking as fail',
      );
      handler.fail();
      return;
    }

    if (handlerState === State.BEGAN) {
      logger.debug(
        'handler is in BEGAN state but shouldActivate returned false - cancelling',
      );
      handler.cancel();
    }
  }

  private shouldBeCancelledByFinishedHandler(handler: GestureHandler): boolean {
    const shouldBeCancelled = (otherHandler: GestureHandler) => {
      return (
        this.shouldHandlerWaitForOther(handler, otherHandler) &&
        otherHandler.getState() === State.END
      );
    };

    return this.gestureHandlers.some(shouldBeCancelled);
  }

  private hasOtherHandlerToWaitFor(handler: GestureHandler): boolean {
    const logger = this.logger.cloneAndJoinPrefix(
      `hasOtherHandlerToWaitFor(handler=${handler.getTag()})`,
    );
    const hasToWaitFor = (otherHandler: GestureHandler) => {
      return (
        !this.isFinished(otherHandler.getState()) &&
        this.shouldHandlerWaitForOther(handler, otherHandler)
      );
    };
    const result = this.gestureHandlers.some(hasToWaitFor);
    logger.debug({
      gestureHandlers: this.gestureHandlers.map(gh => gh.getTag()),
      awaitingHandlers: Array.from(this.awaitingHandlers).map(gh =>
        gh.getTag(),
      ),
      result,
    });
    return result;
  }

  private addAwaitingHandler(handler: GestureHandler): void {
    const logger = this.logger.cloneAndJoinPrefix(
      `addAwaitingHandler(handlerTag=${handler.getTag()})`,
    );
    logger.debug({awaitingHandlers: this.awaitingHandlers});
    if (this.awaitingHandlers.includes(handler)) {
      return;
    }

    this.awaitingHandlers.push(handler);
    this.awaitingHandlersTags.add(handler.getTag());

    handler.setAwaiting(true);
    handler.setActivationIndex(this.activationIndex++);
  }

  private shouldActivate(handler: GestureHandler): boolean {
    const shouldBeCancelledBy = (otherHandler: GestureHandler) => {
      return this.shouldHandlerBeCancelledBy(handler, otherHandler);
    };

    return !this.gestureHandlers.some(shouldBeCancelledBy);
  }

  private shouldHandlerBeCancelledBy(
    handler: GestureHandler,
    otherHandler: GestureHandler,
  ): boolean {
    if (this.canRunSimultaneously(handler, otherHandler)) {
      return false;
    }

    if (handler.isAwaiting() || handler.getState() === State.ACTIVE) {
      return handler.shouldBeCancelledByOther(otherHandler);
    }

    const handlerPointers: number[] = handler.getTrackedPointersID();
    const otherPointers: number[] = otherHandler.getTrackedPointersID();

    if (
      !PointerTracker.shareCommonPointers(handlerPointers, otherPointers) &&
      handler.getView() !== otherHandler.getView()
    ) {
      return this.checkOverlap(handler, otherHandler);
    }

    return true;
  }

  private canRunSimultaneously(
    gh1: GestureHandler,
    gh2: GestureHandler,
  ): boolean {
    return (
      gh1 === gh2 ||
      gh1.shouldRecognizeSimultaneously(gh2) ||
      gh2.shouldRecognizeSimultaneously(gh1)
    );
  }

  private checkOverlap(
    handler: GestureHandler,
    otherHandler: GestureHandler,
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
        handler.getView()?.isPositionInBounds({x: handlerX, y: handlerY}) &&
        otherHandler.getView()?.isPositionInBounds({x: handlerX, y: handlerY})
      ) {
        overlap = true;
      }
    });
    otherPointers.forEach((pointer: number) => {
      const otherX: number = otherHandler.getTracker().getLastX(pointer);
      const otherY: number = otherHandler.getTracker().getLastY(pointer);
      if (
        handler.getView()?.isPositionInBounds({x: otherX, y: otherY}) &&
        otherHandler.getView()?.isPositionInBounds({x: otherX, y: otherY})
      ) {
        overlap = true;
      }
    });
    return overlap;
  }

  private makeActive(handler: GestureHandler): void {
    const currentState = handler.getState();

    handler.setActive(true);
    handler.setShouldResetProgress(true);
    handler.setActivationIndex(this.activationIndex++);

    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      if (this.shouldHandlerBeCancelledBy(this.gestureHandlers[i], handler)) {
        this.gestureHandlers[i].cancel();
      }
    }

    for (const otherHandler of this.awaitingHandlers) {
      if (this.shouldHandlerBeCancelledBy(otherHandler, handler)) {
        otherHandler.setAwaiting(false);
      }
    }

    handler.sendEvent({newState: State.ACTIVE, oldState: State.BEGAN});

    if (currentState !== State.ACTIVE) {
      handler.sendEvent({newState: State.END, oldState: State.ACTIVE});
      if (currentState !== State.END) {
        handler.sendEvent({newState: State.UNDETERMINED, oldState: State.END});
      }
    }

    if (!handler.isAwaiting()) {
      return;
    }

    handler.setAwaiting(false);

    this.awaitingHandlers = this.awaitingHandlers.filter(
      otherHandler => otherHandler !== handler,
    );
  }

  private cleanupFinishedHandlers(): void {
    const handlersToRemove = new Set<GestureHandler>();

    for (let i = this.gestureHandlers.length - 1; i >= 0; --i) {
      const handler = this.gestureHandlers[i];

      if (this.isFinished(handler.getState()) && !handler.isAwaiting()) {
        this.cleanHandler(handler);
        handlersToRemove.add(handler);
      }
    }

    this.gestureHandlers = this.gestureHandlers.filter(
      handler => !handlersToRemove.has(handler),
    );
  }

  private cleanupAwaitingHandlers(handler: GestureHandler): void {
    const shouldWait = (otherHandler: GestureHandler) => {
      return (
        !otherHandler.isAwaiting() &&
        this.shouldHandlerWaitForOther(otherHandler, handler)
      );
    };

    for (const otherHandler of this.awaitingHandlers) {
      if (shouldWait(otherHandler)) {
        this.cleanHandler(otherHandler);
        this.awaitingHandlersTags.delete(otherHandler.getTag());
      }
    }

    this.awaitingHandlers = this.awaitingHandlers.filter(otherHandler =>
      this.awaitingHandlersTags.has(otherHandler.getTag()),
    );
  }

  private cleanHandler(handler: GestureHandler): void {
    handler.reset();
    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_VALUE);
  }

  public registerHandlerIfNotPresent(handler: GestureHandler) {
    this.logger.info(`registerHandlerIfNotPresent(${handler.getTag()})`);
    if (this.gestureHandlers.includes(handler)) {
      return;
    }
    this.gestureHandlers.push(handler);
    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_SAFE_INTEGER);
  }

  // This function is called when handler receives touchdown event
  // If handler is using mouse or pen as a pointer and any handler receives touch event,
  // mouse/pen event dissappears - it doesn't send onPointerCancel nor onPointerUp (and others)
  // This became a problem because handler was left at active state without any signal to end or fail
  // To handle this, when new touch event is received, we loop through active handlers and check which type of
  // pointer they're using. If there are any handler with mouse/pen as a pointer, we cancel them
  public cancelMouseAndPenGestures(currentHandler: GestureHandler): void {
    this.gestureHandlers.forEach((handler: GestureHandler) => {
      if (
        handler.getPointerType() !== PointerType.MOUSE &&
        handler.getPointerType() !== PointerType.PEN
      ) {
        return;
      }

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

  private scheduleFinishedHandlersCleanup(): void {
    if (this.handlingChangeSemaphore === 0) {
      this.cleanupFinishedHandlers();
    }
  }

  public removeHandlerFromOrchestrator(handler: GestureHandler): void {
    const indexInGestureHandlers = this.gestureHandlers.indexOf(handler);
    const indexInAwaitingHandlers = this.awaitingHandlers.indexOf(handler);

    if (indexInGestureHandlers >= 0) {
      this.gestureHandlers.splice(indexInGestureHandlers, 1);
    }

    if (indexInAwaitingHandlers >= 0) {
      this.awaitingHandlers.splice(indexInAwaitingHandlers, 1);
      this.awaitingHandlersTags.delete(handler.getTag());
    }
  }

  public recordHandlerIfNotPresent(handler: GestureHandler): void {
    if (this.gestureHandlers.includes(handler)) {
      return;
    }

    this.gestureHandlers.push(handler);

    handler.setActive(false);
    handler.setAwaiting(false);
    handler.setActivationIndex(Number.MAX_SAFE_INTEGER);
  }

  private shouldHandlerWaitForOther(
    handler: GestureHandler,
    otherHandler: GestureHandler,
  ): boolean {
    return (
      handler !== otherHandler &&
      (handler.shouldWaitForHandlerFailure(otherHandler) ||
        otherHandler.shouldRequireToWaitForFailure(handler))
    );
  }
}
