import { RNPackage, } from "@rnoh/react-native-openharmony";
import type { UITurboModule, UITurboModuleContext } from "@rnoh/react-native-openharmony/ts";
import { RNGestureHandlerModule } from './rnoh/RNGestureHandlerModule';

export default class GestureHandlerPackage extends RNPackage {
  getUITurboModuleFactoryByNameMap(): Map<string, (ctx: UITurboModuleContext) => UITurboModule | null> {
    return new Map().set(RNGestureHandlerModule.NAME, (ctx: UITurboModuleContext) => new RNGestureHandlerModule(ctx))
  }
}
