import { z } from 'zod';

import { defineRpcEndpoint } from '../rpc/schemas';

const getInfoResponseBodySchema = z.object({
  version: z.string(),
  supportedMethods: z.array(z.string()).optional(),
  platform: z.union([z.literal('mobile'), z.literal('extension')]),
});

export const getInfo = defineRpcEndpoint({
  method: 'getInfo',
  result: getInfoResponseBodySchema,
});
