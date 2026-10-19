import { z } from 'zod';

import { numberField } from '@shared/forms/field-schemas';

export const nonceValidator = numberField('Nonce must be a positive integer or 0').check(
  z.refine<number | undefined>(value => value === undefined || Number.isInteger(value), {
    error: 'nonce must be an integer',
  }),
  z.refine<number | undefined>(value => value === undefined || value >= 0, {
    error: 'Nonce must be zero or more',
  })
);
