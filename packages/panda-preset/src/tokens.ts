import { defineTokens } from '@pandacss/dev';

import { tokens as leatherTokens, zIndices } from '@leather.io/tokens';

import { borders } from './borders';
import { colors } from './colors';

function transformZIndices(zIndices: Record<string, number>) {
  return Object.fromEntries(Object.entries(zIndices).map(([key, value]) => [key, { value }]));
}

export const tokens = defineTokens({
  ...leatherTokens,
  colors,
  zIndex: transformZIndices(zIndices),
  borders,
});
