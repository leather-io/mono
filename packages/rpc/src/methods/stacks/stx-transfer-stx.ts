import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';
import {
  baseStacksTransactionConfigSchema,
  stacksTransactionDetailsSchema,
} from './_stacks-helpers';

export const stxTransferStx = defineRpcEndpoint({
  method: 'stx_transferStx',
  params: z.intersection(
    z.object({
      recipient: z.string(),
      amount: z.coerce.number(),
      memo: z.string().optional(),
    }),
    baseStacksTransactionConfigSchema
  ),
  result: stacksTransactionDetailsSchema,
});
