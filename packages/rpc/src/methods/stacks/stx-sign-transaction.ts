import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

// Leather's RPC params prior to SIP-30
// Developers should be warned away from this structure
export const stxSignTransactionRequestLeatherRpcParamsSchema = z.object({
  txHex: z.string(),
  stxAddress: z.string().optional(),
  attachment: z.string().optional(),
  accountIndex: z.string().optional(),
  network: z.string().optional(),
});

// SIP-30 params
export const stxSignTransactionRequestSip30ParamsSchema = z.object({
  transaction: z.string(),
  network: z.string().optional(),
});

export const stxSignTransaction = defineRpcEndpoint({
  method: 'stx_signTransaction',
  params: z.union([
    stxSignTransactionRequestLeatherRpcParamsSchema,
    stxSignTransactionRequestSip30ParamsSchema,
  ]),
  result: z.object({
    transaction: z.string(),
    txHex: z.string(),
  }),
});
