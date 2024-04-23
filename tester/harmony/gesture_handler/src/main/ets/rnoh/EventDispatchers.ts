import { RNInstance } from '@rnoh/react-native-openharmony/ts';
import { EventDispatcher, GestureStateChangeEvent, GestureUpdateEvent, GestureTouchEvent, RNGHLogger } from "../core"

export class JSEventDispatcher implements EventDispatcher {
  constructor(private rnInstance: RNInstance, private logger: RNGHLogger) {
  }

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    this.logger.info(`onGestureHandlerStateChange`);
    this.rnInstance.emitDeviceEvent('onGestureHandlerStateChange', event);
  }

  public onGestureHandlerEvent(
    event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent,
  ) {
    this.logger.info(`onGestureHandlerEvent`);
    this.rnInstance.emitDeviceEvent('onGestureHandlerEvent', event);
  }
}

export class AnimatedEventDispatcher implements EventDispatcher {
  constructor(
    private rnInstance: RNInstance,
    private logger: RNGHLogger,
    private viewTag: number,
  ) {}

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    this.logger.info(`onGestureHandlerStateChange`);
    this.rnInstance.emitDeviceEvent('onGestureHandlerStateChange', event);
  }

  public onGestureHandlerEvent(
    event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent,
  ) {
    this.logger.info(`onGestureHandlerEvent`);
    this.rnInstance.emitComponentEvent(
      this.viewTag,
      'onGestureHandlerEvent',
      event,
    );
  }
}

export class ReanimatedEventDispatcher implements EventDispatcher {
  constructor(
    private rnInstance: RNInstance,
    private logger: RNGHLogger,
    private viewTag: number,
  ) {}

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    this.logger.info(`onGestureHandlerStateChange`);
    this.rnInstance.emitComponentEvent(
      this.viewTag,
      'onGestureHandlerStateChange',
      event,
    );
  }

  public onGestureHandlerEvent(
    event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent,
  ) {
    this.logger.info(`onGestureHandlerEvent`);
    this.rnInstance.emitComponentEvent(
      this.viewTag,
      'onGestureHandlerEvent',
      event,
    );
  }
}
