import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../../rpc/schemas';
import { clarityValueSchema, cvTupleSchema } from './_clarity-values';

export const stxSignStructuredMessageMethodName = 'stx_signStructuredMessage';

type StxSignStructuredMessageRequestMethodName = typeof stxSignStructuredMessageMethodName;

// Request
export const stxSignStructuredMessageRequestParamsSchema = z.object({
  message: clarityValueSchema,
  domain: cvTupleSchema,
});

export type StxSignStructuredMessageRequestParams = z.infer<
  typeof stxSignStructuredMessageRequestParamsSchema
>;

export type StxSignStructuredMessageRequest = RpcRequest<
  StxSignStructuredMessageRequestMethodName,
  StxSignStructuredMessageRequestParams
>;

// Result
export const stxSignStructuredMessageResponseBodySchema = z.object({
  signature: z.string(),
  publicKey: z.string(),
});

export type StxSignStructuredMessageResponse = RpcResponse<
  typeof stxSignStructuredMessageResponseBodySchema
>;

export type DefineStxSignStructuredMessageMethod = DefineRpcMethod<
  StxSignStructuredMessageRequest,
  StxSignStructuredMessageResponse
>;
