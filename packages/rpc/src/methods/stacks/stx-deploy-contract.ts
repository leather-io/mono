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

export const stxDeployContractMethodName = 'stx_deployContract';

type StxDeployContractRequestMethodName = typeof stxDeployContractMethodName;

// Request
export const stxDeployContractRequestParamsSchema = z.intersection(
  z.object({
    name: z.string(),
    clarityCode: z.string(),
    clarityVersion: z.coerce.number().optional(),
  }),
  baseStacksTransactionConfigSchema
);

export type StxDeployContractRequestParams = z.infer<typeof stxDeployContractRequestParamsSchema>;

export type StxDeployContractRequest = RpcRequest<
  StxDeployContractRequestMethodName,
  StxDeployContractRequestParams
>;

// Result
export const stxDeployContractResponseBodySchema = stacksTransactionDetailsSchema;

export const stxDeployContractResponseSchema = createRpcResponseSchema(
  stxDeployContractResponseBodySchema,
  defaultErrorSchema
);

export type StxDeployContractResponse = z.infer<typeof stxDeployContractResponseSchema>;

export type DefineStxDeployContractMethod = DefineRpcMethod<
  StxDeployContractRequest,
  StxDeployContractResponse
>;
