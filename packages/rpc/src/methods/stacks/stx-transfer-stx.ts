import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';
import { stacksTransactionDetailsSchema } from './_stacks-helpers';

export const stxTransferStx = defineRpcEndpoint({
  method: 'stx_transferStx',
  params: z
    .object({
      recipient: z.string(),
      amount: z.coerce.number(),
      memo: z.string().optional(),
    })
    .passthrough(),
  result: stacksTransactionDetailsSchema,
});
