import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

// Implements BIP-322
// https://github.com/bitcoin/bips/blob/master/bip-0322.mediawiki
export const Bip322MessageTypesSchema = z.enum(['legacy', 'bip322']);
export type Bip322MessageTypes = z.infer<typeof Bip322MessageTypesSchema>;

const supportedPaymentTypesSchema = z.enum(['p2tr', 'p2wpkh']);

export const signMessageRequestParamsSchema = z
  .object({
    type: Bip322MessageTypesSchema.optional(),
    account: z.number().optional(),
    message: z.string(),
    paymentType: supportedPaymentTypesSchema,
  })
  .passthrough();

export const signMessage = defineRpcEndpoint({
  method: 'signMessage',
  params: signMessageRequestParamsSchema,
  result: z
    .object({
      signature: z.string(),
      address: z.string(),
    })
    .passthrough(),
});
