import {TurboModule, TurboModuleRegistry} from 'react-native';
import {RNGestureHandlerModuleProps} from "react-native-gesture-handler/src/RNGestureHandlerModule"

interface Spec extends TurboModule, RNGestureHandlerModuleProps {}

export const RNGestureHandlerModule = TurboModuleRegistry.get<Spec>('RNGestureHandlerModule')!;
