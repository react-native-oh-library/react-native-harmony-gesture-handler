import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
import { GestureHandlerPackage } from '@rnoh/react-native-openharmony-gesture-handler/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [new GestureHandlerPackage(ctx)];
}
