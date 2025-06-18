module.exports = function (api) {
  api.cache(true);
  return {
    plugins: ['macros', '@babel/plugin-transform-class-static-block', 'react-compiler'],
    presets: ['babel-preset-expo'],
  };
};
