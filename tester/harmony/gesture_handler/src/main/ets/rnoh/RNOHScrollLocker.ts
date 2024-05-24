import { RNInstance } from '@rnoh/react-native-openharmony/ts';
import { ScrollLocker, RNGHLogger } from '../core';

export class RNOHScrollLockerArkTS implements ScrollLocker {
  constructor(private rnInstance: RNInstance) {
  }

  lockScrollContainingViewTag(viewTag: number) {
    return this.rnInstance.blockComponentsGestures(viewTag);
  }
}

export class RNOHScrollLockerCAPI implements ScrollLocker {
  private logger: RNGHLogger

  constructor(private rnInstance: RNInstance, logger: RNGHLogger) {
    this.logger = logger.cloneWithPrefix("RNOHScrollLockerCAPI")
  }

  lockScrollContainingViewTag(viewTag: number) {
    this.rnInstance.postMessageToCpp('RNGH::SET_NATIVE_RESPONDERS_BLOCK', {
      targetTag: viewTag,
      shouldBlock: true,
    });
    return () => {
      this.rnInstance.postMessageToCpp('RNGH::SET_NATIVE_RESPONDERS_BLOCK', {
        targetTag: viewTag,
        shouldBlock: false,
      });
    };
  }
}
