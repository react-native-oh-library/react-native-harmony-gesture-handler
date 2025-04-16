import {RNInstance} from '@rnoh/react-native-openharmony/ts';
import {
  ScrollLocker,
  RNGHLogger,
  GestureHandlerRegistry,
  Handler,
} from '../core';

export class RNOHScrollLockerCAPI implements ScrollLocker {
  private logger: RNGHLogger;

  constructor(
    private rnInstance: RNInstance,
    logger: RNGHLogger,
    private gestureHandlerRegistry: GestureHandlerRegistry,
  ) {
    this.logger = logger.cloneAndJoinPrefix('RNOHScrollLockerCAPI');
  }

  lockScrollContainingViewTag(
    viewTag: number,
    simultaneousHandlers?: Handler[] | null,
  ) {
    // When acquiring a scroll lock, we need to check if there are any simultaneous handlers
    // that are NativeViewGestureHandlers. If so, we need to release the scroll lock. On Android
    // when NativeViewGestureHandler is used, touch events are passed directly to the wrapped view's
    // touch event handler. In the case of ScrollView, this behavior causes scrolling to be unlocked
    // even when other handlers which should block scrolling are active.
    const nativeViewGestureHandlers = (simultaneousHandlers ?? [])
      .map(handler =>
      typeof handler === 'number' ? handler : handler.handlerTag,
      )
      .map(handlerTag =>
      this.gestureHandlerRegistry.getGestureHandlerByHandlerTag(handlerTag),
      )
      .filter(handler => handler.getName() === 'NativeViewGestureHandler');

    this.setScrollLock(viewTag, nativeViewGestureHandlers.length === 0);

    return () => this.setScrollLock(viewTag, false);
  }

  private setScrollLock(targetTag: number, shouldBlock: boolean) {
    this.rnInstance.postMessageToCpp('RNGH::SET_NATIVE_RESPONDERS_BLOCK', {
      targetTag,
      shouldBlock,
    });
  }
}
