import { z } from 'zod';

export const sendFormBtcSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: '',
  }),
  recipient: z.string(),
  memo: z.string().optional(),
  fee: z.string(),
});

export type SendFormBtcSchema = z.infer<typeof sendFormBtcSchema>;

export const defaultSendFormBtcValues: SendFormBtcSchema = {
  amount: '',
  recipient: '',
  memo: '',
  fee: '',
};
