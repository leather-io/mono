import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../../rpc/schemas';
import { stacksTransactionDetailsSchema } from './_stacks-helpers';

export const stxCallContractMethodName = 'stx_callContract';

type StxCallContractRequestMethodName = typeof stxCallContractMethodName;

// Request
export const stxCallContractRequestParamsSchema = z.object({
  contract: z.string(),
  asset: z.string(),
  amount: z.coerce.number(),
});

export type StxCallContractRequestParams = z.infer<typeof stxCallContractRequestParamsSchema>;

export type StxCallContractRequest = RpcRequest<
  StxCallContractRequestMethodName,
  StxCallContractRequestParams
>;

// Result
export const stxCallContractResponseBodySchema = stacksTransactionDetailsSchema;

export type StxCallContractResponse = RpcResponse<typeof stxCallContractResponseBodySchema>;

export type DefineStxCallContractMethod = DefineRpcMethod<
  StxCallContractRequest,
  StxCallContractResponse
>;
