import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  preflight: true,

  include: ['./**/*.web.{js,jsx,ts,tsx}'],

  exclude: [],

  prefix: 'leather',
  // this works but should check if I really need: @pandacss/dev then get rid of all `theme-web` stuff out of here
  presets: ['@leather-wallet/panda-preset'],

  studio: { logo: '💼' },

  jsxFramework: 'react',

  strictTokens: false,

  outdir: 'leather-styles',
  outExtension: 'js',
  minify: true,
});
