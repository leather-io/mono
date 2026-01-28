module.exports = function (api) {
  api.cache(false);
  return {
    plugins: ['@lingui/babel-plugin-lingui-macro', 'react-native-worklets/plugin'],
  };
};
