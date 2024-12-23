import { z } from 'zod';

export const sendFormBtcSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: '',
  }),
  senderDerivationPath: z.string(),
  recipient: z.string().min(1),
  feeRate: z.string(),
});

export type SendFormBtcSchema = z.infer<typeof sendFormBtcSchema>;

export const defaultSendFormBtcValues: SendFormBtcSchema = {
  amount: '',
  senderDerivationPath: '',
  recipient: '',
  feeRate: '',
};
