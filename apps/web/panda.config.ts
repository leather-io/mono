import { defineConfig } from '@pandacss/dev';

import { globalLoaderCss } from './app/layouts/nav/global-loader.styles';

const navbar = { navbar: { value: '142px' } };

export default defineConfig({
  preflight: true,

  include: ['./app/**/*.{ts,tsx}', './node_modules/@leather.io/ui/dist-web/**/*.{js,jsx,ts,tsx}'],

  globalCss: globalLoaderCss,

  presets: ['@leather.io/panda-preset'],

  jsxFramework: 'react',
  prefix: 'leather',

  outdir: 'leather-styles',

  theme: {
    tokens: {
      sizes: { ...navbar },
      spacing: { ...navbar },
    },
  },
});
