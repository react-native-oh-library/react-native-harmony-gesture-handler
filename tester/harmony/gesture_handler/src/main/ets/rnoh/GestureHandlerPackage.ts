import {RNPackage, TurboModulesFactory} from "@rnoh/react-native-openharmony/ts";
import type {TurboModule, TurboModuleContext} from "@rnoh/react-native-openharmony/ts";
import {RNGestureHandlerModule} from './RNGestureHandlerModule';

class GestureHandlerTurboModuleFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === RNGestureHandlerModule.NAME) {
      return new RNGestureHandlerModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === RNGestureHandlerModule.NAME;
  }
}

/**
 * @deprecated: Use the package class exported from ../RNOHPackage.ets (2024-10-10)
 */
export class GestureHandlerPackage extends RNPackage {
  createUITurboModuleFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new GestureHandlerTurboModuleFactory(ctx);
  }
}
