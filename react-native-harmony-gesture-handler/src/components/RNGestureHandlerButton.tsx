import {
  registerViewConfig,
  ReactNativeViewAttributes,
} from 'react-native-harmony';

export const RNGestureHandlerButton = registerViewConfig(
  'RNGestureHandlerButton',
  () => ({
    uiViewClassName: 'RNGestureHandlerButton',
    bubblingEventTypes: {},
    directEventTypes: {},
    validAttributes: {
      ...ReactNativeViewAttributes.UIView,
      exclusive: true,
      foreground: true,
      borderless: true,
      enabled: true,
      rippleColor: true,
      rippleRadius: true,
      touchSoundDisabled: true,
    },
  })
);
