import { RNInstanceManager } from "rnoh/ts"
import { GestureStateChangeEvent, GestureUpdateEvent } from "./OutgoingEvent"

export class EventDispatcher {
  constructor(private rnInstanceManager: RNInstanceManager) {
  }

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    this.rnInstanceManager.emitDeviceEvent("onGestureHandlerStateChange", event)
  }

  public onGestureHandlerEvent(event: GestureStateChangeEvent | GestureUpdateEvent) {
    this.rnInstanceManager.emitDeviceEvent("onGestureHandlerEvent", event)
  }
}