import { getWebTextVariants } from '@leather-wallet/tokens';
import { defineTextStyles } from '@pandacss/dev';

const leatherTextStyles = getWebTextVariants();

// ts-unused-exports:disable-next-line
export const textStyles = defineTextStyles({ ...leatherTextStyles });
