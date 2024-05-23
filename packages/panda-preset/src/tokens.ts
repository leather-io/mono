import { tokens as leatherTokens } from '@leather-wallet/tokens';
import { defineTokens } from '@pandacss/dev';

import { colors } from './colors';

export const tokens = defineTokens({
  ...leatherTokens,

  colors,
});
