import { RNInstance } from '@rnoh/react-native-openharmony/ts';
import {
  OutgoingEventDispatcher,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  GestureTouchEvent,
  RNGHLogger
} from "../core"

export class JSEventDispatcher implements OutgoingEventDispatcher {
  private logger: RNGHLogger

  constructor(private rnInstance: RNInstance, logger: RNGHLogger) {
    this.logger = logger.cloneAndJoinPrefix("JSEventDispatcher")
  }

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    const stopTracing = this.logger.cloneAndJoinPrefix(`onGestureHandlerStateChange`).startTracing();
    this.rnInstance.emitDeviceEvent('onGestureHandlerStateChange', event);
    stopTracing()
  }

  public onGestureHandlerEvent(
    event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent,
  ) {
    const stopTracing = this.logger.cloneAndJoinPrefix(`onGestureHandlerEvent`).startTracing();
    this.rnInstance.emitDeviceEvent('onGestureHandlerEvent', event);
    stopTracing()
  }
}

export class AnimatedEventDispatcher implements OutgoingEventDispatcher {
  private logger: RNGHLogger

  constructor(
    private rnInstance: RNInstance,
    logger: RNGHLogger,
    private viewTag: number,
  ) {
    this.logger = logger.cloneAndJoinPrefix("AnimatedEventDispatcher")
  }

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    const stopTracing = this.logger.cloneAndJoinPrefix(`onGestureHandlerStateChange`).startTracing()
    this.rnInstance.emitDeviceEvent('onGestureHandlerStateChange', event);
    stopTracing()
  }

  public onGestureHandlerEvent(
    event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent,
  ) {
    const stopTracing = this.logger.cloneAndJoinPrefix(`onGestureHandlerEvent`).startTracing();
    this.rnInstance.emitComponentEvent(
      this.viewTag,
      'onGestureHandlerEvent',
      event,
    );
    stopTracing()
  }
}

export class ReanimatedEventDispatcher implements OutgoingEventDispatcher {
  private logger: RNGHLogger

  constructor(
    private rnInstance: RNInstance,
    logger: RNGHLogger,
    private viewTag: number,
  ) {
    this.logger = logger.cloneAndJoinPrefix("ReanimatedEventDispatcher")
  }

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    const stopTracing = this.logger.cloneAndJoinPrefix(`onGestureHandlerStateChange`).startTracing();
    this.rnInstance.emitComponentEvent(
      this.viewTag,
      'onGestureHandlerStateChange',
      event,
    );
    stopTracing()
  }

  public onGestureHandlerEvent(
    event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent,
  ) {
    const stopTracing = this.logger.cloneAndJoinPrefix(`onGestureHandlerEvent`).startTracing();
    this.rnInstance.emitComponentEvent(
      this.viewTag,
      'onGestureHandlerEvent',
      event,
    );
    stopTracing()
  }
}
