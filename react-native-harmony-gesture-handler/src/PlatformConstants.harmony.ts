import { Platform } from 'react-native';

type PlatformConstants = {
  forceTouchAvailable: boolean;
};

// Patched this line because original failed in bridgeless
export default Platform.constants as PlatformConstants;
