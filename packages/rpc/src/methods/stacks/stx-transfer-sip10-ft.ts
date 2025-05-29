import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';
import {
  baseStacksTransactionConfigSchema,
  stacksTransactionDetailsSchema,
} from './_stacks-helpers';

export const stxTransferSip10Ft = defineRpcEndpoint({
  method: 'stx_transferSip10Ft',
  params: z.intersection(
    z
      .object({
        recipient: z.string(),
        asset: z.string(),
        amount: z.coerce.number(),
      })
      .passthrough(),
    baseStacksTransactionConfigSchema
  ),
  result: stacksTransactionDetailsSchema,
});
