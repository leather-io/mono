import { definePreset } from '@pandacss/dev';

import { breakpoints } from './breakpoints';
import { keyframes } from './keyframes';
import { buttonRecipe } from './recipes/button-recipe';
import { linkRecipe } from './recipes/link-recipe';
import { semanticTokens } from './semantic-tokens';
import { tokens } from './tokens';
import { textStyles } from './typography';

export default definePreset({
  name: 'leather',
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
});
