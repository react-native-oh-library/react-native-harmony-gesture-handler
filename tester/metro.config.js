const {mergeConfig} = require('metro-config');
const harmonyMetroConfig = require('react-native-harmony/metro.config');

/**
 * @type {import("@types/metro-config").ConfigT}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(harmonyMetroConfig, config);
