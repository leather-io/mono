import { z } from 'zod';

import { defineRpcEndpoint } from '../rpc/schemas';

export const supportedMethodSchema = z.object({
  name: z.string(),
  docsUrl: z.union([z.string(), z.array(z.string())]),
});

export const supportedMethods = defineRpcEndpoint({
  method: 'supportedMethods',
  result: z.object({
    documentation: z.string(),
    methods: z.array(supportedMethodSchema),
  }),
});
