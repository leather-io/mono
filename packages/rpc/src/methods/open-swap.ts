import { z } from 'zod';

import { defineRpcEndpoint } from '../rpc/schemas';

const openSwapRequestParamsSchema = z.object({
  base: z.string(),
  quote: z.string(),
});

const openSwapResponseBodySchema = z.object({
  message: z.string(),
});

export const openSwap = defineRpcEndpoint({
  method: 'openSwap',
  params: openSwapRequestParamsSchema,
  result: openSwapResponseBodySchema,
});
