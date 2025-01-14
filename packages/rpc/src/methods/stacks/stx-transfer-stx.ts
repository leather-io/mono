import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../../rpc/schemas';
import {
  baseStacksTransactionConfigSchema,
  stacksTransactionDetailsSchema,
} from './_stacks-helpers';

export const stxTransferStxMethodName = 'stx_transferStx';

type StxTransferStxRequestMethodName = typeof stxTransferStxMethodName;

// Request
export const stxTransferStxRequestParamsSchema = z.intersection(
  z.object({
    recipient: z.string(),
    amount: z.number(),
    memo: z.string().optional(),
  }),
  baseStacksTransactionConfigSchema
);

export type StxTransferStxRequestParams = z.infer<typeof stxTransferStxRequestParamsSchema>;

export type StxTransferStxRequest = RpcRequest<
  StxTransferStxRequestMethodName,
  StxTransferStxRequestParams
>;

// Result
export const stxTransferStxResponseBodySchema = stacksTransactionDetailsSchema;

export type StxTransferStxResponse = RpcResponse<typeof stxTransferStxResponseBodySchema>;

export type DefineStxTransferStxMethod = DefineRpcMethod<
  StxTransferStxRequest,
  StxTransferStxResponse
>;
