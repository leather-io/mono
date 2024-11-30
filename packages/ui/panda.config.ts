import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  preflight: true,

  include: ['./**/*.web.{ts,tsx}', './**/*.web.stories.{ts,tsx}', './**/*.shared.{ts,tsx}'],

  exclude: [],

  prefix: 'leather',

  presets: ['@leather.io/panda-preset'],

  studio: { logo: '🖤' },

  jsxFramework: 'react',

  strictTokens: false,

  staticCss: {
    css: [
      {
        properties: {
          maxContentWidth: ['*'],
        },
      },
    ],
  },

  outdir: 'leather-styles',
  outExtension: 'js',
  minify: true,
});
