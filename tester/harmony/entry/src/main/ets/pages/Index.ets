import {
  RNApp,
  ComponentBuilderContext,
  RNAbility,
  AnyJSBundleProvider,
  ResourceJSBundleProvider,
  MetroJSBundleProvider
} from 'rnoh'
import { RNGestureHandlerRootView, RNGestureHandlerButton, GestureHandlerPackage } from "rnoh-gesture-handler"


@Entry
@Component
struct Index {
  @StorageLink('RNAbility') rnAbility: RNAbility | undefined = undefined

  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
    if (ctx.descriptor.type === RNGestureHandlerRootView.DESCRIPTOR_TYPE) {
      RNGestureHandlerRootView({
        tag: ctx.descriptor.tag,
        ctx: ctx.rnohContext,
        buildCustomComponent: this.buildCustomComponent.bind(this)
      })
    } else if (ctx.descriptor.type === RNGestureHandlerButton.DESCRIPTOR_TYPE) {
      RNGestureHandlerButton({
        tag: ctx.descriptor.tag,
        ctx: ctx.rnohContext,
        buildCustomComponent: this.buildCustomComponent.bind(this)
      })
    }
  }

  build() {
    Column() {
      RNApp({
        appKey: "app_name",
        rnInstance: { createRNPackages: (ctx) => [
          new GestureHandlerPackage(ctx)
        ] },
        buildCustomComponent: this.buildCustomComponent.bind(this),
        jsBundleProvider: new AnyJSBundleProvider([
          new MetroJSBundleProvider(),
          new ResourceJSBundleProvider(this.rnAbility.context.resourceManager, 'bundle.harmony.js')]),
      })
    }
    .height('100%')
    .width('100%')
  }
}
