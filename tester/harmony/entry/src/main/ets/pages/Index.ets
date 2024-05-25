import { RNApp, RNOHErrorDialog, ComponentBuilderContext, RNOHCoreContext, MetroJSBundleProvider } from "@rnoh/react-native-openharmony"
import { RNGestureHandlerRootView, RNGestureHandlerButton, GestureHandlerPackage } from "@react-native-oh-tpl/react-native-gesture-handler"

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

const wrappedCustomRNComponentBuilder = wrapBuilder(CustomComponentBuilder)

@Entry
@Component
struct Index {
  @StorageLink('RNOHCoreContext') rnohCoreContext: RNOHCoreContext | undefined = undefined

  build() {
    Column() {
      if (this.rnohCoreContext) {
        RNOHErrorDialog({ ctx: this.rnohCoreContext });
        RNApp({
          appKey: "app_name",
          rnInstanceConfig: {
            enableCAPIArchitecture: true,
            createRNPackages: (ctx) => [
              new GestureHandlerPackage(ctx)
            ]
          },
          buildCustomComponent: CustomComponentBuilder,
          jsBundleProvider: new MetroJSBundleProvider(),
          wrappedCustomRNComponentBuilder: wrappedCustomRNComponentBuilder,
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
