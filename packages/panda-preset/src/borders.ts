import { defineTokens } from '@pandacss/dev';

export const borders = defineTokens.borders({
  none: { value: 'none' },
  default: { value: '1px solid {colors.ink.border-default}' },
});
