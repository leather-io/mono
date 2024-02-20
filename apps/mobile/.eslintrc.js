const path = require('path');

module.exports = {
  extends: ['@leather-wallet/eslint-config', 'universe/native'],
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json'),
  },
  ignorePatterns: ['.eslintrc.js', "*.js"],
  rules: {
    'import/order': 0,
    'no-void': 0
  },
};
