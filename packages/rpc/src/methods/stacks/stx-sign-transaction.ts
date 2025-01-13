import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../../rpc/schemas';

export const stxSignTransactionMethodName = 'stx_signTransaction';

// Leather's RPC params prior to SIP-30
// Developers should be warned away from this structure
export const stxSignTransactionRequestLeatherRpcParamsSchema = z.object({
  txHex: z.string(),
  stxAddress: z.string().optional(),
  attachment: z.string().optional(),
  accountIndex: z.string().optional(),
});

// SIP-30 params
export const stxSignTransactionRequestSip30ParamsSchema = z.object({ transaction: z.string() });

export const stxSignTransactionRequestParamsSchema = z.union([
  stxSignTransactionRequestLeatherRpcParamsSchema,
  stxSignTransactionRequestSip30ParamsSchema,
]);

export type StxSignTransactionRequestParams = z.infer<typeof stxSignTransactionRequestParamsSchema>;

// For backwards compatibility, we return the same data under both properties
export const stxSignTransactionResponseSchema = z.object({
  transaction: z.string(),
  txHex: z.string(),
});

export type StxSignTransactionResponseBody = z.infer<typeof stxSignTransactionResponseSchema>;

export type StxSignTransactionRequest = RpcRequest<
  typeof stxSignTransactionMethodName,
  StxSignTransactionRequestParams
>;

export type StxSignTransactionResponse = RpcResponse<StxSignTransactionResponseBody>;

export type DefineStxSignTransactionMethod = DefineRpcMethod<
  StxSignTransactionRequest,
  StxSignTransactionResponse
>;
