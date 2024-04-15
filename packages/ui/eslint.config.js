// @ts-check
import eslintNativeConfig from 'eslint-config-universe/native.js';
import tseslint from 'typescript-eslint';

import config from '../../eslint.config.js';

export default tseslint.config(eslintNativeConfig, {
  extends: [...config],
  ignores: ['.eslintrc.js', '*.js', 'dist-all', '.storybook*', 'metro.config.cjs'],
});
