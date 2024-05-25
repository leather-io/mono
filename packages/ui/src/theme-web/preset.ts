import { definePreset } from '@pandacss/dev';

import { buttonRecipe } from './recipes/button-recipe';
import { linkRecipe } from './recipes/link-recipe';

//  TODO - remove after discussion on best location for recipes
export default definePreset({
  theme: {
    extend: {
      recipes: { button: buttonRecipe, link: linkRecipe },
    },
  },
});
