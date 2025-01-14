import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../../rpc/schemas';
import { clarityValueSchema } from './_clarity-values';
import {
  baseStacksTransactionConfigSchema,
  stacksTransactionDetailsSchema,
} from './_stacks-helpers';

export const stxCallContractMethodName = 'stx_callContract';

type StxCallContractRequestMethodName = typeof stxCallContractMethodName;

// Request
export const stxCallContractRequestParamsSchema = z.intersection(
  z.object({
    contract: z.string(),
    functionName: z.string(),
    functionArgs: z.array(clarityValueSchema).optional(),
  }),
  baseStacksTransactionConfigSchema
);

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
