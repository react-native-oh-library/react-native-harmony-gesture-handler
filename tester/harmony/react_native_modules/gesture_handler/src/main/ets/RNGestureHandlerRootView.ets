import { Descriptor, RNOHContext, RNViewBase, ComponentBuilderContext, RNComponentFactory } from "rnoh"
import { RNGHRootTouchHandler } from "./RNGHRootTouchHandler"
import { RNGestureHandlerModule } from "./RNGestureHandlerModule"

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
  @BuilderParam buildCustomComponent: (componentBuilderContext: ComponentBuilderContext) => void
  @State descriptor: RNGestureHandlerRootViewDescriptor = {} as RNGestureHandlerRootViewDescriptor
  private unsubscribes: (() => void)[] = []
  private touchHandler: RNGHRootTouchHandler | undefined = undefined

  aboutToAppear() {
    const rnGestureHandlerModule = this.ctx.rnInstanceManager.getTurboModule<RNGestureHandlerModule>(RNGestureHandlerModule.NAME)
    this.touchHandler = RNGHRootTouchHandler.from(this.ctx.descriptorRegistry, rnGestureHandlerModule.getGestureHandlerRegistry())
    this.handleDescriptorChange(this.ctx.descriptorRegistry.getDescriptor<RNGestureHandlerRootViewDescriptor>(this.tag))
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
      ForEach(this.descriptor.childrenTags, (childrenTag) => {
        RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
      }, childrenTag => childrenTag)
      Stack() {}
      .width("100%")
      .height("100%")
      .onTouch((e) => {
        console.log("RNGH::RootView onTouch")
        this.touchHandler.handleTouch(e)}
      )
    }
  }
}