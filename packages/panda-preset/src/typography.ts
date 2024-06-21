import { defineTextStyles } from '@pandacss/dev';

import { getWebTextVariants } from '@leather.io/tokens';

export const textStyles = defineTextStyles({ ...getWebTextVariants() });
