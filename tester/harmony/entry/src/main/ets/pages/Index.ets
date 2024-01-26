import {
  RNApp,
  ComponentBuilderContext,
  RNAbility,
  MetroJSBundleProvider
} from 'rnoh'
import { RNGestureHandlerRootView, RNGestureHandlerButton, GestureHandlerPackage } from "rnoh-gesture-handler"

@Builder
function CustomComponentBuilder(ctx: ComponentBuilderContext) {
  if (ctx.componentName === RNGestureHandlerRootView.NAME) {
    RNGestureHandlerRootView({
      tag: ctx.tag,
      ctx: ctx.rnComponentContext,
      buildCustomComponent: CustomComponentBuilder
    })
  } else if (ctx.componentName === RNGestureHandlerButton.NAME) {
    RNGestureHandlerButton({
      tag: ctx.tag,
      ctx: ctx.rnComponentContext,
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
          jsBundleProvider: new MetroJSBundleProvider(),
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
