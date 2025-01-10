import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../../rpc/schemas';
import { stacksTransactionDetailsSchema } from './_stacks-helpers';

export const stxDeployContractMethodName = 'stx_deployContract';

type StxDeployContractRequestMethodName = typeof stxDeployContractMethodName;

// Request
export const stxDeployContractRequestParamsSchema = z.object({
  name: z.string(),
  clarityCode: z.string(),
  clarityVersion: z.coerce.number().optional(),
});

export type StxDeployContractRequestParams = z.infer<typeof stxDeployContractRequestParamsSchema>;

export type StxDeployContractRequest = RpcRequest<
  StxDeployContractRequestMethodName,
  StxDeployContractRequestParams
>;

// Result
export const stxDeployContractResponseBodySchema = stacksTransactionDetailsSchema;

export type StxDeployContractResponse = RpcResponse<typeof stxDeployContractResponseBodySchema>;

export type DefineStxDeployContractMethod = DefineRpcMethod<
  StxDeployContractRequest,
  StxDeployContractResponse
>;
