import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';
import { addressResponseBodySchema } from '../get-addresses';

/** @deprecated `stx_getAddresses` returns `{ addresses }`, see `stxGetAddressesResponseBodySchema` */
export const stxAddressItemSchema = z.object({
  address: z.string(),
  publicKey: z.string(),
  derivationPath: z.string(),
});

// SIP-030 defines the result as an object with an `addresses` array
export const stxGetAddressesResponseBodySchema = addressResponseBodySchema;

export const stxGetAddresses = defineRpcEndpoint({
  method: 'stx_getAddresses',
  params: z
    .object({ network: z.string().optional(), allowPolicyAccounts: z.boolean().optional() })
    .optional(),
  result: stxGetAddressesResponseBodySchema,
});
