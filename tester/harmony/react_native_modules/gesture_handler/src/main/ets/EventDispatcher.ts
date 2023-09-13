import { RNInstanceManager } from "rnoh/ts"
import { GestureStateChangeEvent, GestureUpdateEvent, GestureTouchEvent } from "./OutgoingEvent"
import { RNGHLogger } from './RNGHLogger'

export interface EventDispatcher {
  onGestureHandlerStateChange(event: GestureStateChangeEvent): void
  onGestureHandlerEvent(event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent): void
}

export class JSEventDispatcher implements EventDispatcher {
  constructor(private rnInstanceManager: RNInstanceManager, private logger: RNGHLogger) {
  }

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    this.logger.info(`onGestureHandlerStateChange`)
    this.rnInstanceManager.emitDeviceEvent("onGestureHandlerStateChange", event)
  }

  public onGestureHandlerEvent(event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent) {
    this.logger.info(`onGestureHandlerEvent`)
    this.rnInstanceManager.emitDeviceEvent("onGestureHandlerEvent", event)
  }
}

export class AnimatedEventDispatcher implements EventDispatcher {
  constructor(private rnInstanceManager: RNInstanceManager, private logger: RNGHLogger, private viewTag: number) {
  }

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    this.logger.info(`onGestureHandlerStateChange`)
    this.rnInstanceManager.emitDeviceEvent("onGestureHandlerStateChange", event)
  }

  public onGestureHandlerEvent(event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent) {
    this.logger.info(`onGestureHandlerEvent`)
    this.rnInstanceManager.emitComponentEvent(this.viewTag, "onGestureHandlerEvent", event)
  }
}