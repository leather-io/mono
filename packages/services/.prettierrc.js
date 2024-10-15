import config from '@leather.io/prettier-config';

export default {
  ...config,
  plugins: [...config.plugins, '@babel/plugin-proposal-decorators'],
  parser: 'babel-ts',
};
