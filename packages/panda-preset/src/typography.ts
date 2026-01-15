import { defineTextStyles } from '@pandacss/dev';

import { getWebTextVariants } from '@leather.io/tokens/config';

export const textStyles = defineTextStyles({ ...getWebTextVariants() });
