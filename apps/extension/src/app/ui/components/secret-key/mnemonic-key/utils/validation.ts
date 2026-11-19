import { wordlist } from '@scure/bip39/wordlists/english';
import { z } from 'zod';

import { stringField } from '@shared/forms/field-schemas';

import { createFormikValidationSchema } from '@app/common/validation/formik-validation-schema';

function isValidMnemonic(word: string): boolean {
  return wordlist.includes(word);
}

const dynamicObjectValue = stringField().check(
  z.refine<string | undefined>(
    value => {
      if (!value) return false;
      return isValidMnemonic(value);
    },
    { error: issue => `${String(issue.path?.at(-1))} is invalid` }
  )
);

export const validationSchema = createFormikValidationSchema(
  z.object({}).catchall(dynamicObjectValue)
);
