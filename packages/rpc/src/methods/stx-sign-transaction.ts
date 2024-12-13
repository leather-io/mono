import { StacksNetworks } from '@stacks/network';
import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc/schemas';

export const stxSignTransactionMethodName = 'stx_signTransaction' as const;

export const stxSignTransactionRequestParamsSchema = z.object({
  stxAddress: z.string().optional(),
  txHex: z.string(),
  attachment: z.string().optional(),
  accountIndex: z.string().optional(),
  network: z.enum(StacksNetworks).optional(),
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
