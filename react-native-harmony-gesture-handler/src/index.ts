declare const global: {
  isFormsStackingContext: (node: unknown) => boolean | null; // JSI function
};

global.isFormsStackingContext = () => true; // TODO: add using JSI

import { initialize } from 'react-native-gesture-handler/src/init';

// export { Directions } from './Directions';
export { State } from 'react-native-gesture-handler/src/State';
export { default as gestureHandlerRootHOC } from 'react-native-gesture-handler/src/components/gestureHandlerRootHOC';
export { default as GestureHandlerRootView } from './components/GestureHandlerRootView';
export type {
  // event types
  GestureEvent,
  HandlerStateChangeEvent,
  // event payloads types
  GestureEventPayload,
  HandlerStateChangeEventPayload,
  // pointer events
  GestureTouchEvent,
  TouchData,
  // new api event types
  GestureUpdateEvent,
  GestureStateChangeEvent,
} from 'react-native-gesture-handler/src/handlers/gestureHandlerCommon';
export type { GestureType } from 'react-native-gesture-handler/src/handlers/gestures/gesture';
export type {
  TapGestureHandlerEventPayload,
  TapGestureHandlerProps,
} from 'react-native-gesture-handler/src/handlers/TapGestureHandler';
export type {
  ForceTouchGestureHandlerEventPayload,
  ForceTouchGestureHandlerProps,
} from 'react-native-gesture-handler/src/handlers/ForceTouchGestureHandler';
export type { ForceTouchGestureChangeEventPayload } from 'react-native-gesture-handler/src/handlers/gestures/forceTouchGesture';
export type {
  LongPressGestureHandlerEventPayload,
  LongPressGestureHandlerProps,
} from 'react-native-gesture-handler/src/handlers/LongPressGestureHandler';
export type {
  PanGestureHandlerEventPayload,
  PanGestureHandlerProps,
} from 'react-native-gesture-handler/src/handlers/PanGestureHandler';
export type { PanGestureChangeEventPayload } from 'react-native-gesture-handler/src/handlers/gestures/panGesture';
export type {
  PinchGestureHandlerEventPayload,
  PinchGestureHandlerProps,
} from 'react-native-gesture-handler/src/handlers/PinchGestureHandler';
export type { PinchGestureChangeEventPayload } from 'react-native-gesture-handler/src/handlers/gestures/pinchGesture';
export type {
  RotationGestureHandlerEventPayload,
  RotationGestureHandlerProps,
} from 'react-native-gesture-handler/src/handlers/RotationGestureHandler';
export type {
  FlingGestureHandlerEventPayload,
  FlingGestureHandlerProps,
} from 'react-native-gesture-handler/src/handlers/FlingGestureHandler';
export { TapGestureHandler } from 'react-native-gesture-handler/src/handlers/TapGestureHandler';
// export { ForceTouchGestureHandler } from './handlers/ForceTouchGestureHandler';
// export { LongPressGestureHandler } from './handlers/LongPressGestureHandler';
export { PanGestureHandler } from 'react-native-gesture-handler/src/handlers/PanGestureHandler';
// export { PinchGestureHandler } from './handlers/PinchGestureHandler';
// export { RotationGestureHandler } from './handlers/RotationGestureHandler';
// export { FlingGestureHandler } from './handlers/FlingGestureHandler';
export { default as createNativeWrapper } from 'react-native-gesture-handler/src/handlers/createNativeWrapper';
export type {
  NativeViewGestureHandlerPayload,
  NativeViewGestureHandlerProps,
} from 'react-native-gesture-handler/src/handlers/NativeViewGestureHandler';
export { GestureDetector } from 'react-native-gesture-handler/src/handlers/gestures/GestureDetector';
export { GestureObjects as Gesture } from 'react-native-gesture-handler/src/handlers/gestures/gestureObjects';
export type { TapGestureType as TapGesture } from 'react-native-gesture-handler/src/handlers/gestures/tapGesture';
export type { PanGestureType as PanGesture } from 'react-native-gesture-handler/src/handlers/gestures/panGesture';
export type { FlingGestureType as FlingGesture } from 'react-native-gesture-handler/src/handlers/gestures/flingGesture';
export type { LongPressGestureType as LongPressGesture } from 'react-native-gesture-handler/src/handlers/gestures/longPressGesture';
export type { PinchGestureType as PinchGesture } from 'react-native-gesture-handler/src/handlers/gestures/pinchGesture';
export type { RotationGestureType as RotationGesture } from 'react-native-gesture-handler/src/handlers/gestures/rotationGesture';
export type { ForceTouchGestureType as ForceTouchGesture } from 'react-native-gesture-handler/src/handlers/gestures/forceTouchGesture';
export type { NativeGestureType as NativeGesture } from 'react-native-gesture-handler/src/handlers/gestures/nativeGesture';
export type { ManualGestureType as ManualGesture } from 'react-native-gesture-handler/src/handlers/gestures/manualGesture';
export type {
  ComposedGestureType as ComposedGesture,
  RaceGestureType as RaceGesture,
  SimultaneousGestureType as SimultaneousGesture,
  ExclusiveGestureType as ExclusiveGesture,
} from 'react-native-gesture-handler/src/handlers/gestures/gestureComposition';
export type { GestureStateManagerType as GestureStateManager } from 'react-native-gesture-handler/src/handlers/gestures/gestureStateManager';
// export { NativeViewGestureHandler } from './handlers/NativeViewGestureHandler';
export type {
  RawButtonProps,
  BaseButtonProps,
  RectButtonProps,
  BorderlessButtonProps,
} from 'react-native-gesture-handler/src/components/GestureButtons';
export {
  RawButton,
  BaseButton,
  RectButton,
  BorderlessButton,
  PureNativeButton,
} from 'react-native-gesture-handler/src/components/GestureButtons';
export {
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler/src/components/touchables';
export {
  ScrollView,
  Switch,
  TextInput,
  DrawerLayoutAndroid,
  FlatList,
  RefreshControl,
} from 'react-native-gesture-handler/src/components/GestureComponents';
export type {
  //events
  GestureHandlerGestureEvent,
  GestureHandlerStateChangeEvent,
  //event payloads
  GestureHandlerGestureEventNativeEvent,
  GestureHandlerStateChangeNativeEvent,
  NativeViewGestureHandlerGestureEvent,
  NativeViewGestureHandlerStateChangeEvent,
  TapGestureHandlerGestureEvent,
  TapGestureHandlerStateChangeEvent,
  ForceTouchGestureHandlerGestureEvent,
  ForceTouchGestureHandlerStateChangeEvent,
  LongPressGestureHandlerGestureEvent,
  LongPressGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandlerGestureEvent,
  PinchGestureHandlerStateChangeEvent,
  RotationGestureHandlerGestureEvent,
  RotationGestureHandlerStateChangeEvent,
  FlingGestureHandlerGestureEvent,
  FlingGestureHandlerStateChangeEvent,
  // handlers props
  NativeViewGestureHandlerProperties,
  TapGestureHandlerProperties,
  LongPressGestureHandlerProperties,
  PanGestureHandlerProperties,
  PinchGestureHandlerProperties,
  RotationGestureHandlerProperties,
  FlingGestureHandlerProperties,
  ForceTouchGestureHandlerProperties,
  // buttons props
  RawButtonProperties,
  BaseButtonProperties,
  RectButtonProperties,
  BorderlessButtonProperties,
} from 'react-native-gesture-handler/src/handlers/gestureHandlerTypesCompat';

export { default as Swipeable } from 'react-native-gesture-handler/src/components/Swipeable';
export type {
  DrawerLayoutProps,
  DrawerPosition,
  DrawerState,
  DrawerType,
  DrawerLockMode,
  DrawerKeyboardDismissMode,
} from 'react-native-gesture-handler/src/components/DrawerLayout';
export { default as DrawerLayout } from 'react-native-gesture-handler/src/components/DrawerLayout';

export {
  enableExperimentalWebImplementation,
  enableLegacyWebImplementation,
} from 'react-native-gesture-handler/src/EnableNewWebImplementation';

initialize();
