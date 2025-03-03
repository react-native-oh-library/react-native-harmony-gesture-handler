import type { RNPackageContext, RNOHPackage, RNOHCoreContext } from '@rnoh/react-native-openharmony';
import GestureHandlerPackage from '@rnoh/react-native-openharmony-gesture-handler';

export function createRNPackages(ctx: RNPackageContext, isDebugModeEnabled: boolean = true): RNOHPackage[] {
  return [new GestureHandlerPackage(ctx, isDebugModeEnabled)];
}
