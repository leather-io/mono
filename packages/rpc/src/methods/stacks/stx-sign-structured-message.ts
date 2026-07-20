import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';
import { stacksRpcNetworkSchema } from './_stacks-helpers';

export const stxSignStructuredMessage = defineRpcEndpoint({
  method: 'stx_signStructuredMessage',
  params: z.object({
    domain: z.string(),
    message: z.string(),
    network: stacksRpcNetworkSchema.optional(),
  }),
  result: z.object({
    signature: z.string(),
    publicKey: z.string(),
  }),
});
