import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  prefix: 'leather',
  outdir: 'leather-styles',
  staticCss: {
    css: [
      {
        properties: {
          maxContentWidth: ['*'],
        },
      },
    ],
  },
});
