import { RNGestureHandlerModule } from '../RNGestureHandlerModule'; // RNGH: patch

let flushOperationsScheduled = false;

export function scheduleFlushOperations() {
  if (!flushOperationsScheduled) {
    flushOperationsScheduled = true;
    queueMicrotask(() => {
      if (RNGestureHandlerModule) {
        RNGestureHandlerModule.flushOperations();
      }
      flushOperationsScheduled = false;
    });
  }
}
