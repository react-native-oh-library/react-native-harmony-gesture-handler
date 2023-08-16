import { RNInstanceManager } from "rnoh/ts"
import { GestureStateChangeEvent, GestureUpdateEvent, GestureTouchEvent } from "./OutgoingEvent"
import { RNGHLogger } from './RNGHLogger'

export class EventDispatcher {
  constructor(private rnInstanceManager: RNInstanceManager, private logger: RNGHLogger) {
  }

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    this.logger.info(`onGestureHandlerStateChange: ${JSON.stringify(event)}`)
    this.rnInstanceManager.emitDeviceEvent("onGestureHandlerStateChange", event)
  }

  public onGestureHandlerEvent(event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent) {
    this.logger.info(`onGestureHandlerEvent: ${JSON.stringify(event)}`)
    this.rnInstanceManager.emitDeviceEvent("onGestureHandlerEvent", event)
  }
}