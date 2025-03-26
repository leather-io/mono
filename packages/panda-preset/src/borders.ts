import { defineTokens } from '@pandacss/dev';

export const borders = defineTokens.borders({
  none: { value: 'none' },
  default: { value: '0.5px solid {colors.ink.border-default}' },
});
