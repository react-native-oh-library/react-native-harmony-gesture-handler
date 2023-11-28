import {
  RNApp,
  ComponentBuilderContext,
  RNAbility,
  AnyJSBundleProvider,
  ResourceJSBundleProvider,
  MetroJSBundleProvider
} from 'rnoh'
import { RNGestureHandlerRootView, RNGestureHandlerButton, GestureHandlerPackage, RNGestureHandlerModule } from "rnoh-gesture-handler"

@Builder
function CustomComponentBuilder(ctx: ComponentBuilderContext) {
  if (ctx.componentName === RNGestureHandlerRootView.NAME) {
    RNGestureHandlerRootView({
      tag: ctx.tag,
      ctx: ctx.rnohContext,
      buildCustomComponent: CustomComponentBuilder
    })
  } else if (ctx.descriptor.type === RNGestureHandlerButton.DESCRIPTOR_TYPE) {
    RNGestureHandlerButton({
      tag: ctx.descriptor.tag,
      ctx: ctx.rnohContext,
      buildCustomComponent: CustomComponentBuilder
    })
  }
}

@Entry
@Component
struct Index {
  @StorageLink('RNAbility') rnAbility: RNAbility | undefined = undefined
  @State isVisible: boolean = false

  aboutToAppear() {
    setTimeout(() => this.isVisible = true, 1500)
  }

  build() {
    Column() {
      if (this.rnAbility && this.isVisible) {
        RNApp({
          appKey: "app_name",
          rnInstanceConfig: { createRNPackages: (ctx) => [
            new GestureHandlerPackage(ctx)
          ] },
          buildCustomComponent: CustomComponentBuilder,
          jsBundleProvider: new AnyJSBundleProvider([
            // new MetroJSBundleProvider(),
            new ResourceJSBundleProvider(this.rnAbility.context.resourceManager, 'bundle.harmony.js')]),
          onSetUp: (rnInstance) => {
            rnInstance.bindComponentNameToDescriptorType(RNGestureHandlerRootView.NAME, "RootView")
            rnInstance.getTurboModule<RNGestureHandlerModule>(RNGestureHandlerModule.NAME).install()
          }
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
