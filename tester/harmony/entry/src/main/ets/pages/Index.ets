import {
  RNApp,
  ComponentBuilderContext,
  RNAbility,
  AnyJSBundleProvider,
  ResourceJSBundleProvider,
  MetroJSBundleProvider
} from 'rnoh'
import { RNGestureHandlerRootView, RNGestureHandlerButton, GestureHandlerPackage } from "rnoh-gesture-handler"

@Builder
function CustomComponentBuilder(ctx: ComponentBuilderContext) {
  if (ctx.descriptor.type === RNGestureHandlerRootView.NAME) {
    RNGestureHandlerRootView({
      tag: ctx.descriptor.tag,
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

  build() {
    Column() {
      if (this.rnAbility) {
        RNApp({
          appKey: "app_name",
          rnInstanceConfig: { createRNPackages: (ctx) => [
            new GestureHandlerPackage(ctx)
          ] },
          buildCustomComponent: CustomComponentBuilder,
          jsBundleProvider: new AnyJSBundleProvider([
            new MetroJSBundleProvider(),
            new ResourceJSBundleProvider(this.rnAbility.context.resourceManager, 'bundle.harmony.js')]),
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
