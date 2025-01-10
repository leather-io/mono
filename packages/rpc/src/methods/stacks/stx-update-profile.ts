import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../../rpc/schemas';
import { stacksTransactionDetailsSchema } from './_stacks-helpers';

export const stxUpdateProfileMethodName = 'stx_updateProfile';

type StxUpdateProfileRequestMethodName = typeof stxUpdateProfileMethodName;

// Request
export const stxUpdateProfileRequestParamsSchema = z.object({
  // schema.org/Person
  person: z.object({}).passthrough(),
});

export type StxUpdateProfileRequestParams = z.infer<typeof stxUpdateProfileRequestParamsSchema>;

export type StxUpdateProfileRequest = RpcRequest<
  StxUpdateProfileRequestMethodName,
  StxUpdateProfileRequestParams
>;

// Result
export const stxUpdateProfileResponseBodySchema = stacksTransactionDetailsSchema;

export type StxUpdateProfileResponse = RpcResponse<typeof stxUpdateProfileResponseBodySchema>;

export type DefineStxUpdateProfileMethod = DefineRpcMethod<
  StxUpdateProfileRequest,
  StxUpdateProfileResponse
>;
