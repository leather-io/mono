import { z } from 'zod';

import { defineRpcEndpoint } from '../rpc/schemas';

export const open = defineRpcEndpoint({
  method: 'open',
  params: z.object({
    base: z.string(),
    quote: z.string(),
  }),
  result: z.object({
    message: z.string(),
  }),
});
