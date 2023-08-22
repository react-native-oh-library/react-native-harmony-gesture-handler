import { Descriptor, RNOHContext, RNViewBase, ComponentBuilderContext, RNComponentFactory } from "rnoh"

export type RNGestureHandlerButtonDescriptor = Descriptor<"RNGestureHandlerButton", {
}>

@Component
export struct RNGestureHandlerButton {
  static DESCRIPTOR_TYPE = "RNGestureHandlerButton" as const
  ctx: RNOHContext
  tag: number
  @BuilderParam buildCustomComponent: (componentBuilderContext: ComponentBuilderContext) => void
  @State descriptor: RNGestureHandlerButtonDescriptor = {} as RNGestureHandlerButtonDescriptor
  private unsubscribes: (() => void)[] = []

  aboutToAppear() {
    this.handleDescriptorChange(this.ctx.descriptorRegistry.getDescriptor<RNGestureHandlerButtonDescriptor>(this.tag))
    this.unsubscribes.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag, (d) => {
      this.handleDescriptorChange(d as RNGestureHandlerButtonDescriptor)
    }))
  }

  aboutToDisappear() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe())
  }

  handleDescriptorChange(newDescriptor: RNGestureHandlerButtonDescriptor) {
    this.descriptor = newDescriptor
  }

  private dispatchEvent(eventName: string, payload: any) {
    this.ctx.rnInstanceManager.emitComponentEvent(this.tag, `RNGestureHandlerButtontop${eventName}`, payload)
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      ForEach(this.descriptor.childrenTags, (childrenTag) => {
        RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
      }, childrenTag => childrenTag)
    }
  }
}