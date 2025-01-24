import { z } from 'zod';

import { defaultSendFormValues, sendFormSchema } from './send-form.schema';

export const sendFormBtcSchema = sendFormSchema.extend({
  senderDerivationPath: z.string(),
});

export type SendFormBtcSchema = z.infer<typeof sendFormBtcSchema>;

export const defaultSendFormBtcValues: SendFormBtcSchema = {
  ...defaultSendFormValues,
  senderDerivationPath: '',
};
