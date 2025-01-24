import { z } from 'zod';

// zod is used for basic field validation to disable the button unless its mostly correct
// more advanced validation is then performed in utils for a better UX
export const sendFormSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0),
  currencyMode: z.union([z.literal('crypto'), z.literal('fiat')]),
  recipient: z.string().min(41),
  feeRate: z.string(),
});

type SendFormSchema = z.infer<typeof sendFormSchema>;

export const defaultSendFormValues: SendFormSchema = {
  amount: '0',
  currencyMode: 'crypto',
  recipient: '',
  feeRate: '',
};
