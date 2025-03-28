import { z } from 'zod';

import { defineRpcEndpoint } from '../rpc/schemas';

export const open = defineRpcEndpoint({
  method: 'open',
  params: z
    .object({ mode: z.enum(['fullpage', 'popup']) })
    .passthrough()
    .optional(),
  result: z.null(),
});

export type OpenParams = z.infer<typeof open.params>;
