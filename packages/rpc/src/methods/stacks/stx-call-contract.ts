import { z } from 'zod';

import {
  DefineRpcMethod,
  RpcRequest,
  createRpcResponseSchema,
  defaultErrorSchema,
} from '../../rpc/schemas';
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
    functionArgs: z.array(z.string()).optional(),
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

export const stxCallContractResponseSchema = createRpcResponseSchema(
  stxCallContractResponseBodySchema,
  defaultErrorSchema
);

export type StxCallContractResponse = z.infer<typeof stxCallContractResponseSchema>;

export type DefineStxCallContractMethod = DefineRpcMethod<
  StxCallContractRequest,
  StxCallContractResponse
>;
