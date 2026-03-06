module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // NOTE: react-native-reanimated v4+ no longer needs the babel plugin
    // The old 'react-native-reanimated/plugin' causes crashes with v4+
    plugins: [],
    env: {
      production: {
        plugins: ['react-native-paper/babel']
      }
    }
  };
};
