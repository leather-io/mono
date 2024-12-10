import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc/schemas';

export const stxSignTransactionMethodName = 'stx_signTransaction' as const;

const stxSignTransactionRequestParamsSchema = z.object({
  txHex: z.string(),
  stxAddress: z.string().optional(),
  attachment: z.string().optional(),
  accountIndex: z.string().optional(),
});

export type StxSignTransactionRequestParams = z.infer<typeof stxSignTransactionRequestParamsSchema>;

const stxSignTransactionResponseSchema = z.object({ txHex: z.string() });

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
