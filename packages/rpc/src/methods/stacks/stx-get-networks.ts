import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

export const stxGetNetworks = defineRpcEndpoint({
  method: 'stx_getNetworks',
  result: z.object({
    active: z.string(),
    networks: z.array(
      z
        .object({
          id: z.string(),
          chainId: z.string(),
          transactionVersion: z.string(),
        })
        .passthrough()
    ),
  }),
});
