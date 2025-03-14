module.exports = function (api) {
  api.cache(false);
  return {
    plugins: ['macros', '@babel/plugin-transform-class-static-block'],
    presets: ['babel-preset-expo'],
  };
};
