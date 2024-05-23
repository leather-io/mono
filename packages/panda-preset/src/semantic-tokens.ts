import { semanticTokens as leatherSemanticTokens } from '@leather-wallet/tokens';
import { defineSemanticTokens } from '@pandacss/dev';

export const semanticTokens = defineSemanticTokens({
  ...leatherSemanticTokens,
});
