import { codeBodyString } from '@stacks/transactions';
import { z } from 'zod';

export function isValidContractLength(contract: string) {
  try {
    // `codeBodyString` throws when creating a contract deploy transaction in
    // `@stacks/transaction`. Using this method here, we can validate the
    // contract length and gracefully handle the error
    codeBodyString(contract);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e: unknown) {
    return false;
  }
}

export const clarityContractSchema = z
  .string()
  .refine(contract => isValidContractLength(contract), {
    message: 'ContractExceedsMaxLength',
  });
