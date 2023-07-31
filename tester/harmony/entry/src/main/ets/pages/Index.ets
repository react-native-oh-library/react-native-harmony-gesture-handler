import { RNApp, ComponentBuilderContext, RNOHContext } from 'rnoh'


let storage = LocalStorage.GetShared()

@Entry(storage)
@Component
struct Index {
  @LocalStorageProp('RNOHContext') rnohContext: RNOHContext | undefined = undefined

  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
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
