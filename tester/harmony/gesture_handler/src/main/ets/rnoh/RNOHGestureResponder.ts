import { RNInstance } from "@rnoh/react-native-openharmony/ts"
import { RNGestureResponder } from "../core"

export class FakeRNGestureResponder {
  lock() {
    // Cancelling RN events isn't supported in ArkTS architecture.
    return () => {}
  }
}

/**
 * Used in C-API architecture.
 */
export class RNOHGestureResponder implements RNGestureResponder {
  constructor(private rnInstance: RNInstance) {
  }

  lock(viewTag: number): () => void {
    this.rnInstance.postMessageToCpp("RNGH::ROOT_VIEW_IS_HANDLING_TOUCHES", { descendantViewTag: viewTag, isHandlingTouches: true })
    return () => {
      this.rnInstance.postMessageToCpp("RNGH::ROOT_VIEW_IS_HANDLING_TOUCHES", { descendantViewTag: viewTag, isHandlingTouches: false })
    }
  }
}