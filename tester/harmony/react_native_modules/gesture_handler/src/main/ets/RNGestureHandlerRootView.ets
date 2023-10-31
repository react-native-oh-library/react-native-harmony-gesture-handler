import {
  Descriptor,
  RNOHContext,
  RNViewBase,
  ComponentBuilderContext,
  RNComponentFactory,
  Tag,
  TouchTargetHelper
} from "rnoh"
import { RNGHRootTouchHandler } from "./RNGHRootTouchHandler"
import { RNGestureHandlerModule } from "./RNGestureHandlerModule"

export type RNGestureHandlerRootViewDescriptor = Descriptor<"RNGestureHandlerRootView">

@Component
export struct RNGestureHandlerRootView {
  static readonly DESCRIPTOR_TYPE = "RNGestureHandlerRootView"
  ctx!: RNOHContext
  tag: number = -1
  @BuilderParam buildCustomComponent: (componentBuilderContext: ComponentBuilderContext) => void
  @State descriptor: RNGestureHandlerRootViewDescriptor = {} as RNGestureHandlerRootViewDescriptor
  private unsubscribes: (() => void)[] = []
  private touchHandler: RNGHRootTouchHandler | undefined = undefined

  aboutToAppear() {
    const rnGestureHandlerModule = this.ctx.rnInstance.getTurboModule<RNGestureHandlerModule>(RNGestureHandlerModule.NAME)
    const touchTargetHelper = new TouchTargetHelper(this.tag, this.ctx.descriptorRegistry, this.ctx.componentManagerRegistry, this.ctx.logger)
    this.touchHandler = new RNGHRootTouchHandler(
      this.tag,
      rnGestureHandlerModule.getViewRegistry(),
      rnGestureHandlerModule.getGestureHandlerRegistry(),
      touchTargetHelper,
      this.ctx.componentManagerRegistry,
      rnGestureHandlerModule.getLogger())
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

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      ForEach(this.descriptor.childrenTags, (childrenTag: Tag) => {
        RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
      })
      Stack() {
      }
      .width("100%")
      .height("100%")
      .onTouch((e) => {
        this.touchHandler?.handleTouch(e)
      }
      ).hitTestBehavior(HitTestMode.Transparent)

    }
  }
}