import { z } from 'zod';

import { defineRpcEndpoint } from '../rpc/schemas';

export const open = defineRpcEndpoint({
  method: 'open',
  params: z.object({ mode: z.enum(['fullpage', 'popup']) }).default({ mode: 'popup' }),
  result: z.object({ success: z.literal(true) }),
});
