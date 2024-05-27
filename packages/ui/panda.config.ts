import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  preflight: true,

  include: ['./**/*.web.{js,jsx,ts,tsx}'],

  exclude: [],

  prefix: 'leather',
  presets: ['@leather-wallet/panda-preset'],

  studio: { logo: '💼' },

  jsxFramework: 'react',

  strictTokens: false,

  outdir: 'leather-styles',
  outExtension: 'js',
  emitPackage: true,
  minify: true,
});
