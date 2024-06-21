import { defineSemanticTokens } from '@pandacss/dev';

import { semanticTokens as leatherSemanticTokens } from '@leather.io/tokens';

export const semanticTokens = defineSemanticTokens({
  ...leatherSemanticTokens,
});
