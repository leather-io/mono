import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: [
    './app/**/*.{js,jsx,ts,tsx}',
    './node_modules/@leather.io/ui/dist-web/**/*.{js,jsx,ts,tsx}',
  ],

  presets: ['@leather.io/panda-preset'],

  jsxFramework: 'react',
  prefix: 'leather',
  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {},
  },

  // The output directory for your css system
  outdir: 'leather-styles',
});
