import { getWebTextVariants } from '@leather-wallet/tokens';
import { defineTextStyles } from '@pandacss/dev';

export const textStyles = defineTextStyles({ ...getWebTextVariants() });
