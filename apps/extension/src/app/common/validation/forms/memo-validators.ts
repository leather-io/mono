import { MEMO_MAX_LENGTH_BYTES } from '@stacks/transactions';
import { z } from 'zod';

import { isString } from '@leather.io/utils';

import { stringField } from '@shared/forms/field-schemas';

function exceedsMaxLengthBytes(string: string, maxLengthBytes: number): boolean {
  return string ? Buffer.from(string).length > maxLengthBytes : false;
}

function isTxMemoValid(memo: string) {
  return !exceedsMaxLengthBytes(memo, MEMO_MAX_LENGTH_BYTES);
}

export function stxMemoValidator(errorMsg: string) {
  return stringField().check(
    z.refine<string | undefined>(
      value => {
        if (!isString(value)) return true;
        return isTxMemoValid(value);
      },
      { error: errorMsg }
    )
  );
}
