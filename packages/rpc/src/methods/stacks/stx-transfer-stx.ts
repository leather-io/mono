import { z } from 'zod';

import { principalSchema, stacksMemoSchema } from '@leather.io/stacks';

import { defineRpcEndpoint } from '../../rpc/schemas';
import {
  baseStacksTransactionConfigSchema,
  stacksTransactionDetailsSchema,
} from './_stacks-helpers';

export const stxTransferStx = defineRpcEndpoint({
  method: 'stx_transferStx',
  params: z.intersection(
    z.object({
      recipient: principalSchema,
      amount: z.coerce.number().int('Amount must be an integer describing µSTX'),
      memo: stacksMemoSchema.optional(),
    }),
    baseStacksTransactionConfigSchema
  ),
  result: stacksTransactionDetailsSchema,
});
