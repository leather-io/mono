module.exports = function (api) {
  api.cache(false);
  return {
    plugins: ['@lingui/babel-plugin-lingui-macro', '@babel/plugin-transform-class-static-block'],
    presets: ['babel-preset-expo'],
  };
};
