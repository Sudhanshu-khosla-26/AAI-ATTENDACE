const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure react-native-web is properly resolved for Expo web builds
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Explicitly resolve react-native to react-native-web when targeting web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
