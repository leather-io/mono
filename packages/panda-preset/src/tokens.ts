import { defineTokens } from '@pandacss/dev';

import { tokens as leatherTokens } from '@leather.io/tokens';

import { colors } from './colors';

export const tokens = defineTokens({
  ...leatherTokens,
  colors,
});
