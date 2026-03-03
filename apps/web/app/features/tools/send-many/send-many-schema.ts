import { useFormContext } from 'react-hook-form';

import { validateStacksAddress } from '@stacks/transactions';
import { z } from 'zod';

import { MAX_MEMO_BYTES, MAX_RECIPIENTS } from './send-many-constants';

const recipientSchema = z.object({
  address: z
    .string()
    .min(1, 'Address is required')
    .refine(
      val => {
        const principal = val.split('.')[0];
        return validateStacksAddress(principal);
      },
      { message: 'Invalid Stacks address' }
    ),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      val => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Must be a positive number' }
    ),
  memo: z
    .string()
    .max(MAX_MEMO_BYTES, `Memo must be ${MAX_MEMO_BYTES} characters or fewer`)
    .default(''),
});

export const sendManyFormSchema = z.object({
  token: z.enum(['stx', 'sbtc', 'usdc']),
  recipients: z
    .array(recipientSchema)
    .min(1, 'At least one recipient is required')
    .max(MAX_RECIPIENTS, `Maximum ${MAX_RECIPIENTS} recipients`),
});

export type SendManyFormValues = z.infer<typeof sendManyFormSchema>;
export type RecipientRow = z.infer<typeof recipientSchema>;

export const sendManyDefaults: SendManyFormValues = {
  token: 'stx',
  recipients: [{ address: '', amount: '', memo: '' }],
};

export function useSendManyForm() {
  return useFormContext<SendManyFormValues>();
}
