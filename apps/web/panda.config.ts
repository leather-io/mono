import { defineConfig } from '@pandacss/dev';

import { globalLoaderCss } from './app/layouts/nav/global-loader.styles';

const navbar = { navbar: { value: '164px' } };

export default defineConfig({
  preflight: true,

  include: ['./app/**/*.{ts,tsx}', './node_modules/@leather.io/ui/dist-web/**/*.{js,jsx,ts,tsx}'],

  globalCss: {
    ...globalLoaderCss,
    'button:not(:disabled)': { cursor: 'pointer' },
    ':root': {
      '--multisig-collecting-wash':
        'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.16), rgb(from token(colors.orange.action-primary-default) r g b / 0.025))',
      '--multisig-collecting-wash-hover':
        'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.22), rgb(from token(colors.orange.action-primary-default) r g b / 0.045))',
    },
  },

  presets: ['@leather.io/panda-preset/config'],

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
