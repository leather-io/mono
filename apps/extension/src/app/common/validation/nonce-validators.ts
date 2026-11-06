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

export function getNonceInputError(value: unknown) {
  const result = nonceValidator.safeParse(value);
  if (result.success) return undefined;
  return result.error.issues.at(0)?.message;
}
