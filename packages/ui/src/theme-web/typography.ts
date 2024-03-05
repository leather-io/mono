import { getExtensionTextVariants } from '@leather-wallet/tokens';
import { defineTextStyles } from '@pandacss/dev';

const leatherTextStyles = getExtensionTextVariants();

// ts-unused-exports:disable-next-line
export const textStyles = defineTextStyles({ ...leatherTextStyles });
