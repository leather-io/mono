module.exports = function (api) {
  api.cache(false);
  return {
    plugins: [
      '@lingui/babel-plugin-lingui-macro',
      '@babel/plugin-transform-class-static-block',
      'react-native-worklets/plugin',
    ],
    presets: ['babel-preset-expo'],
  };
};
