import { defineConfig, defineGlobalStyles } from '@pandacss/dev';

import leatherPandaPreset from './src/theme-web/leather-panda-preset';

// Use dummy globalCss without any extension specific
const dummyGlobalCss = defineGlobalStyles({});

// Used for UI components development in storybook
export default defineConfig({
  preflight: true,

  include: ['./**/*.web.{js,jsx,ts,tsx}'],

  exclude: [],

  prefix: 'leather',

  presets: [leatherPandaPreset],

  studio: { logo: '💼' },

  jsxFramework: 'react',

  strictTokens: false,

  outdir: 'src/leather-styles',
  outExtension: 'js',
  minify: true,
  globalCss: dummyGlobalCss,
});
