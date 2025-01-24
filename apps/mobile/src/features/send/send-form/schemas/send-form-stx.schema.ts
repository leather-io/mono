import { z } from 'zod';

import { defaultSendFormValues, sendFormSchema } from './send-form.schema';

export const sendFormStxSchema = sendFormSchema.extend({
  // 41 characters for STX address 42 BTC
  memo: z.string().optional(),
  nonce: z.number().refine(val => !isNaN(val) && val >= 0),
  // TODO need better nonce validation message
  // {
  //   message: t({
  //     id: 'send_form.nonce.error',
  //     message: 'Nonce must be a positive integer or 0',
  //   }),
  // }),
  fee: z.string(),
});

// TODO: add new crowdin strings for errors and for approver.stacks.fee.speed.middle

export type SendFormStxSchema = z.infer<typeof sendFormStxSchema>;

export const defaultSendFormStxValues: SendFormStxSchema = {
  ...defaultSendFormValues,
  memo: '',
  nonce: 0,
  fee: '',
};
