import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';
import {
  baseStacksTransactionConfigSchema,
  stacksTransactionDetailsSchema,
} from './_stacks-helpers';

export const stxCallContract = defineRpcEndpoint({
  method: 'stx_callContract',
  params: z.intersection(
    z.object({
      contract: z.string(),
      functionName: z.string(),
      functionArgs: z.array(z.string()).optional(),
    }),
    baseStacksTransactionConfigSchema
  ),
  result: stacksTransactionDetailsSchema,
});
