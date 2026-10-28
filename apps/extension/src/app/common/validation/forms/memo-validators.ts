import { z } from 'zod';

import { isValidStacksMemo } from '@leather.io/stacks';
import { isString } from '@leather.io/utils';

import { stringField } from '@shared/forms/field-schemas';

export function stxMemoValidator(errorMsg: string) {
  return stringField().check(
    z.refine<string | undefined>(
      value => {
        if (!isString(value)) return true;
        return isValidStacksMemo(value);
      },
      { error: errorMsg }
    )
  );
}
