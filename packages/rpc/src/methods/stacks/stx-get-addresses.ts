import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

export const stxAddressItemSchema = z.object({
  address: z.string(),
  publicKey: z.string(),
  derivationPath: z.string(),
});

export const stxGetAddressesResponseBodySchema = z.array(stxAddressItemSchema);

export const stxGetAddresses = defineRpcEndpoint({
  method: 'stx_getAddresses',
  result: stxGetAddressesResponseBodySchema,
});
