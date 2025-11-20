import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  preflight: true,

  include: [
    './src/**/*.web.{ts,tsx}',
    './src/**/*.web.stories.{ts,tsx}',
    './src/**/*.shared.{ts,tsx}',
    './src/**/*.shared.{ts}',
  ],

  exclude: [],

  prefix: 'leather',

  presets: ['@leather.io/panda-preset'],

  studio: { logo: '🖤' },

  jsxFramework: 'react',

  strictTokens: false,

  outdir: 'leather-styles',
  outExtension: 'js',
  minify: true,
});
