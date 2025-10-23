import { RNPackage, RNPackageContext } from "@rnoh/react-native-openharmony";
import type { TurboModule, TurboModuleContext } from "@rnoh/react-native-openharmony/ts";
import { RNGestureHandlerModule } from './rnoh/RNGestureHandlerModule';
import { RNOHPackage } from "@rnoh/react-native-openharmony";

export default class RnohReactNativeHarmonyGestureHandlerPackage extends RNOHPackage {
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
