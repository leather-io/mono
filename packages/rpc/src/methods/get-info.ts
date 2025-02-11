import { z } from 'zod';

import { defineRpcEndpoint } from '../rpc/schemas';

const getInfoResponseBodySchema = z.object({
  version: z.string(),
  supportedMethods: z.array(z.string()).optional(),
});

export const getInfo = defineRpcEndpoint({
  method: 'getInfo',
  result: getInfoResponseBodySchema,
});
