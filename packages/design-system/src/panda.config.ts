import { defineConfig } from '@pandacss/dev';

import { breakpoints } from './theme-web/breakpoints';
import { globalCss } from './theme-web/global/global';
import { keyframes } from './theme-web/keyframes';
import { buttonRecipe } from './theme-web/recipes/button-recipe';
import { linkRecipe } from './theme-web/recipes/link-recipe';
import { semanticTokens } from './theme-web/semantic-tokens';
import { tokens } from './theme-web/tokens';
import { textStyles } from './theme-web/typography';

export default defineConfig({
  preflight: true,

  include: ['./**/*.web.{js,jsx,ts,tsx}'],

  exclude: [],

  prefix: 'leather',

  presets: [],

  studio: { logo: '💼' },

  jsxFramework: 'react',

  strictTokens: false,

  theme: {
    extend: {
      semanticTokens,
      tokens,
      keyframes,
      textStyles,
      breakpoints,
      recipes: { button: buttonRecipe, link: linkRecipe },
    },
  },
  outdir: 'src/leather-styles',
  outExtension: 'js',
  minify: true,
  globalCss,
});
