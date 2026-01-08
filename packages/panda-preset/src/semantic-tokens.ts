import { defineSemanticTokens } from '@pandacss/dev';

import { semanticTokens as leatherSemanticTokens } from '@leather.io/tokens';

export const semanticTokens = defineSemanticTokens({
  ...leatherSemanticTokens,
  shadows: {
    contentOverflowFade: {
      value: {
        base: '{shadows.contentOverflowFadeLight}',
        _dark: '{shadows.contentOverflowFadeDark}',
      },
    },
    elevation: {
      value: {
        base: '{shadows.elevationLight}',
        _dark: '{shadows.elevationDark}',
      },
    },
  },
});
