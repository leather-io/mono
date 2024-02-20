const path = require('path');

module.exports = {
  extends: ['@leather-wallet/eslint-config'],
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json'),
  },
  ignorePatterns: ['.eslintrc.js'],
};
