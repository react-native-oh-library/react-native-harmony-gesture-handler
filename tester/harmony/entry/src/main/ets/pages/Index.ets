import {
  RNApp,
  RNOHErrorDialog,
  AnyJSBundleProvider,
  MetroJSBundleProvider,
  ResourceJSBundleProvider,
  TraceJSBundleProviderDecorator,
  RNOHCoreContext,
  ComponentBuilderContext,
  RNOHLogger
} from "@rnoh/react-native-openharmony";
import { createRNPackages } from '../RNPackagesFactory'
import { RNGestureHandlerButton, RNGestureHandlerRootView } from '@rnoh/react-native-openharmony-gesture-handler';


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
  @State shouldShow: boolean = false
  private logger!: RNOHLogger

  aboutToAppear() {
    this.logger = this.rnohCoreContext!.logger.clone("Index")
    const stopTracing = this.logger.clone("aboutToAppear").startTracing()
    this.shouldShow = true
    stopTracing()
  }

  onBackPress(): boolean | undefined {
    // NOTE: this is required since `Ability`'s `onBackPressed` function always
    // terminates or puts the app in the background, but we want Ark to ignore it completely
    // when handled by RN
    this.rnohCoreContext!.dispatchBackPress()
    return true
  }

  build() {
    Column() {
      if (this.rnohCoreContext && this.shouldShow) {
        if (this.rnohCoreContext?.isDebugModeEnabled) {
          RNOHErrorDialog({ ctx: this.rnohCoreContext })
        }
        RNApp({
          rnInstanceConfig: {
            name: "app_name",
            createRNPackages,
            enableBackgroundExecutor: false,
            enableCAPIArchitecture: true,
          },
          initialProps: { "foo": "bar" } as Record<string, string>,
          appKey: "app_name",
          wrappedCustomRNComponentBuilder: wrappedCustomRNComponentBuilder,
          onSetUp: (rnInstance) => {
            rnInstance.enableFeatureFlag("ENABLE_RN_INSTANCE_CLEAN_UP")
          },
          jsBundleProvider: new TraceJSBundleProviderDecorator(
            new AnyJSBundleProvider([
              new MetroJSBundleProvider(),
              new ResourceJSBundleProvider(this.rnohCoreContext.uiAbilityContext.resourceManager, 'hermes_bundle.hbc'),
              new ResourceJSBundleProvider(this.rnohCoreContext.uiAbilityContext.resourceManager, 'bundle.harmony.js')
            ]),
            this.rnohCoreContext.logger),
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
