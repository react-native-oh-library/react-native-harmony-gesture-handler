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

  build() {
    Column() {
      if (this.rnAbility) {
        RNApp({
          appKey: "app_name",
          rnInstanceConfig: { createRNPackages: (ctx) => [
            new GestureHandlerPackage(ctx)
          ]},
          buildCustomComponent: CustomComponentBuilder,
          jsBundleProvider: new MetroJSBundleProvider(),
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
