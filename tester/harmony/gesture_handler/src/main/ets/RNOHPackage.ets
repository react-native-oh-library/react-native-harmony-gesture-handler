import { RNPackage, RNPackageContext } from "@rnoh/react-native-openharmony";
import type { TurboModule, TurboModuleContext } from "@rnoh/react-native-openharmony/ts";
import { RNGestureHandlerModule } from './rnoh/RNGestureHandlerModule';

export default class RnohReactNativeHarmonyGestureHandlerPackage extends RNPackage {
  private isRNGHDevModeEnabled: boolean

  constructor(ctx: RNPackageContext, isRNGHDevModeEnabled: boolean = false) {
    super(ctx)
    this.isRNGHDevModeEnabled = isRNGHDevModeEnabled
  }

  getUITurboModuleFactoryByNameMap(): Map<string, (ctx: TurboModuleContext) => TurboModule | null> {
    return new Map().set(RNGestureHandlerModule.NAME,
      (ctx: TurboModuleContext) => new RNGestureHandlerModule(ctx, this.isRNGHDevModeEnabled))
  }
}
