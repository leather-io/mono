import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

export const stxSignStructuredMessage = defineRpcEndpoint({
  method: 'stx_signStructuredMessage',
  params: z.object({
    domain: z.string(),
    message: z.string(),
  }),
  result: z.object({
    signature: z.string(),
    publicKey: z.string(),
  }),
});
