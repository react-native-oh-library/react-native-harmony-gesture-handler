import type { RNPackageContext, RNPackage, RNOHCoreContext } from '@rnoh/react-native-openharmony';
import GestureHandlerPackage from '@rnoh/react-native-openharmony-gesture-handler';

export function createRNPackages(ctx: RNPackageContext, isDebugModeEnabled: boolean = true): RNPackage[] {
  return [new GestureHandlerPackage(ctx, isDebugModeEnabled)];
}
