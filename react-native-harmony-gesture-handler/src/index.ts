
import { initialize } from 'react-native-gesture-handler/src/init';

export { Directions } from 'react-native-gesture-handler/src/Directions';
export { State } from 'react-native-gesture-handler/src/State';
export { PointerType } from 'react-native-gesture-handler/src/PointerType';
export { default as gestureHandlerRootHOC } from 'react-native-gesture-handler/src/components/gestureHandlerRootHOC';
export { default as GestureHandlerRootView } from './components/GestureHandlerRootView'; // RNGH: patch
export type {
  // Event types
  GestureEvent,
  HandlerStateChangeEvent,
  // Event payloads types
  GestureEventPayload,
  HandlerStateChangeEventPayload,
  // Pointer events
  GestureTouchEvent,
  TouchData,
  // New api event types
  GestureUpdateEvent,
  GestureStateChangeEvent,
} from 'react-native-gesture-handler/src/handlers/gestureHandlerCommon';
export { MouseButton } from 'react-native-gesture-handler/src/handlers/gestureHandlerCommon';
export type { GestureType } from 'react-native-gesture-handler/src/handlers/gestures/gesture';
export type {
  TapGestureHandlerEventPayload,
  // ForceTouchGestureHandlerEventPayload, // RNGH: patch
  LongPressGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  RotationGestureHandlerEventPayload,
  NativeViewGestureHandlerPayload,
  FlingGestureHandlerEventPayload,
} from 'react-native-gesture-handler/src/handlers/GestureHandlerEventPayload';
export type { TapGestureHandlerProps } from 'react-native-gesture-handler/src/handlers/TapGestureHandler';
// export type { ForceTouchGestureHandlerProps } from 'react-native-gesture-handler/src/handlers/ForceTouchGestureHandler'; // RNGH: patch
export type { ForceTouchGestureChangeEventPayload } from 'react-native-gesture-handler/src/handlers/gestures/forceTouchGesture';
export type { LongPressGestureHandlerProps } from 'react-native-gesture-handler/src/handlers/LongPressGestureHandler';
export type { PanGestureHandlerProps } from 'react-native-gesture-handler/src/handlers/PanGestureHandler';
export type { PanGestureChangeEventPayload } from 'react-native-gesture-handler/src/handlers/gestures/panGesture';
export type { PinchGestureHandlerProps } from 'react-native-gesture-handler/src/handlers/PinchGestureHandler';
export type { PinchGestureChangeEventPayload } from 'react-native-gesture-handler/src/handlers/gestures/pinchGesture';
export type { RotationGestureHandlerProps } from 'react-native-gesture-handler/src/handlers/RotationGestureHandler';
export type { FlingGestureHandlerProps } from 'react-native-gesture-handler/src/handlers/FlingGestureHandler';
export { TapGestureHandler } from 'react-native-gesture-handler/src/handlers/TapGestureHandler';
export { ForceTouchGestureHandler } from 'react-native-gesture-handler/src/handlers/ForceTouchGestureHandler';
export { LongPressGestureHandler } from 'react-native-gesture-handler/src/handlers/LongPressGestureHandler';
export { PanGestureHandler } from 'react-native-gesture-handler/src/handlers/PanGestureHandler';
export { PinchGestureHandler } from 'react-native-gesture-handler/src/handlers/PinchGestureHandler';
export { RotationGestureHandler } from 'react-native-gesture-handler/src/handlers/RotationGestureHandler';
export { FlingGestureHandler } from 'react-native-gesture-handler/src/handlers/FlingGestureHandler';
export { default as createNativeWrapper } from 'react-native-gesture-handler/src/handlers/createNativeWrapper';
export type { NativeViewGestureHandlerProps } from 'react-native-gesture-handler/src/handlers/NativeViewGestureHandler';
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
export type { HoverGestureType as HoverGesture } from 'react-native-gesture-handler/src/handlers/gestures/hoverGesture';
export type {
  ComposedGestureType as ComposedGesture,
  RaceGestureType as RaceGesture,
  SimultaneousGestureType as SimultaneousGesture,
  ExclusiveGestureType as ExclusiveGesture,
} from 'react-native-gesture-handler/src/handlers/gestures/gestureComposition';
export type { GestureStateManagerType as GestureStateManager } from 'react-native-gesture-handler/src/handlers/gestures/gestureStateManager';
export { NativeViewGestureHandler } from 'react-native-gesture-handler/src/handlers/NativeViewGestureHandler';
export type {
  RawButtonProps,
  BaseButtonProps,
  RectButtonProps,
  BorderlessButtonProps,
} from 'react-native-gesture-handler/src/components/GestureButtonsProps';
export {
  RawButton,
  BaseButton,
  RectButton,
  BorderlessButton,
  PureNativeButton,
} from 'react-native-gesture-handler/src/components/GestureButtons';
export type {
  TouchableHighlightProps,
  TouchableOpacityProps,
  TouchableWithoutFeedbackProps,
} from 'react-native-gesture-handler/src/components/touchables';
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
export { HoverEffect } from 'react-native-gesture-handler/src/handlers/gestures/hoverGesture';
export type {
  // Events
  GestureHandlerGestureEvent,
  GestureHandlerStateChangeEvent,
  // Event payloads
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
  // Handlers props
  NativeViewGestureHandlerProperties,
  TapGestureHandlerProperties,
  LongPressGestureHandlerProperties,
  PanGestureHandlerProperties,
  PinchGestureHandlerProperties,
  RotationGestureHandlerProperties,
  FlingGestureHandlerProperties,
  ForceTouchGestureHandlerProperties,
  // Buttons props
  RawButtonProperties,
  BaseButtonProperties,
  RectButtonProperties,
  BorderlessButtonProperties,
} from 'react-native-gesture-handler/src/handlers/gestureHandlerTypesCompat';

export type { SwipeableProps } from 'react-native-gesture-handler/src/components/Swipeable';
export { default as Swipeable } from 'react-native-gesture-handler/src/components/Swipeable';
// export type { PressableProps } from 'react-native-gesture-handler/src/components/Pressable'; // RNGH: patch
// export { default as Pressable } from 'react-native-gesture-handler/src/components/Pressable'; // RNGH: patch

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