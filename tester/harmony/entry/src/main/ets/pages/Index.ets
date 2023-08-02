import { RNApp, ComponentBuilderContext, RNOHContext } from 'rnoh'
import { RNGestureHandlerRootView } from "rnoh-gesture-handler"

let storage = LocalStorage.GetShared()

@Entry(storage)
@Component
struct Index {
  @LocalStorageProp('RNOHContext') rnohContext: RNOHContext | undefined = undefined

  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
    if (ctx.descriptor.type === RNGestureHandlerRootView.DESCRIPTOR_TYPE) {
      RNGestureHandlerRootView({ tag: ctx.descriptor.tag, ctx: ctx.rnohContext })
    }
  }

  build() {
    Column() {
      RNApp({
        rnohContext: this.rnohContext!,
        appName: "app_name",
        buildCustomComponent: this.buildCustomComponent.bind(this)
      })
    }
    .height('100%')
    .width('100%')
  }
}
