import { z } from 'zod';

import {
  DefineRpcMethod,
  createRpcRequestSchema,
  createRpcResponseSchema,
  defaultErrorSchema,
} from '../../rpc/schemas';

export const stxSignTransactionMethodName = 'stx_signTransaction';

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

export const stxSignTransactionRequestParamsSchema = z.union([
  stxSignTransactionRequestLeatherRpcParamsSchema,
  stxSignTransactionRequestSip30ParamsSchema,
]);
export type StxSignTransactionRequestParams = z.infer<typeof stxSignTransactionRequestParamsSchema>;

export const stxSignTransactionRequestSchema = createRpcRequestSchema(
  stxSignTransactionMethodName,
  stxSignTransactionRequestParamsSchema
);
export type StxSignTransactionRequest = z.infer<typeof stxSignTransactionRequestSchema>;

// For backwards compatibility, we return the same data under both properties
export const stxSignTransactionResponseBodySchema = z.object({
  transaction: z.string(),
  txHex: z.string(),
});
export type StxSignTransactionResponseBody = z.infer<typeof stxSignTransactionResponseBodySchema>;

export const stxSignTransactionResponseSchema = createRpcResponseSchema(
  stxSignTransactionResponseBodySchema,
  defaultErrorSchema
);
export type StxSignTransactionResponse = z.infer<typeof stxSignTransactionResponseSchema>;

export type DefineStxSignTransactionMethod = DefineRpcMethod<
  StxSignTransactionRequest,
  StxSignTransactionResponse
>;
