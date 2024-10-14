import type { RNPackageContext, RNOHPackage } from '@rnoh/react-native-openharmony';
import GestureHandlerPackage from '@rnoh/react-native-openharmony-gesture-handler';

export function createRNPackages(ctx: RNPackageContext): RNOHPackage[] {
  return [new GestureHandlerPackage(ctx, true)];
}
