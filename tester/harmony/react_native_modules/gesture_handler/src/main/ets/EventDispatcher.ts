import { RNInstanceManager } from "rnoh/ts"
import { GestureStateChangeEvent, GestureUpdateEvent, GestureTouchEvent } from "./OutgoingEvent"

export class EventDispatcher {
  constructor(private rnInstanceManager: RNInstanceManager) {
  }

  public onGestureHandlerStateChange(event: GestureStateChangeEvent) {
    this.rnInstanceManager.emitDeviceEvent("onGestureHandlerStateChange", event)
  }

  public onGestureHandlerEvent(event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent) {
    this.rnInstanceManager.emitDeviceEvent("onGestureHandlerEvent", event)
  }
}