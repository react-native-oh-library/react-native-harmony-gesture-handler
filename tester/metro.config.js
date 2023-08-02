const harmonyMetroConfig = require('react-native-harmony/metro.config');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * @type {import("@types/metro-config").ConfigT}
 */
const config = {};

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  harmonyMetroConfig,
  config,
);
