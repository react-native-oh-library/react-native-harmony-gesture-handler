import { Descriptor, RNOHContext, RNViewBase } from "rnoh"

export type RNGestureHandlerRootViewDescriptor = Descriptor<"RNGestureHandlerRootView", {
  source: {
    uri?: string,
    html?: string
  }
  injectedJavaScript?: string
  javaScriptEnabled?: boolean
}>

@Component
export struct RNGestureHandlerRootView {
  static DESCRIPTOR_TYPE = "RNGestureHandlerRootView" as const
  ctx: RNOHContext
  tag: number
  @State descriptor: RNGestureHandlerRootViewDescriptor | undefined = undefined
  private unsubscribes: (() => void)[] = []

  aboutToAppear() {
    this.unsubscribes.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag, (d) => {
      this.handleDescriptorChange(d as RNGestureHandlerRootViewDescriptor)
    }))
  }

  aboutToDisappear() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe())
  }

  handleDescriptorChange(newDescriptor: RNGestureHandlerRootViewDescriptor) {
    this.descriptor = newDescriptor
  }

  private dispatchEvent(eventName: string, payload: any) {
    this.ctx.rnInstanceManager.emitComponentEvent(this.tag, `RNGestureHandlerRootViewtop${eventName}`, payload)
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Stack() {
      }
      .width("100%")
      .height("100%")
      .backgroundColor("red")
    }
  }
}