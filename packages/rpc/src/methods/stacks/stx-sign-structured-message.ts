import { z } from 'zod';

import {
  DefineRpcMethod,
  createRpcRequestSchema,
  createRpcResponseSchema,
  defaultErrorSchema,
} from '../../rpc/schemas';

export const stxSignStructuredMessageMethodName = 'stx_signStructuredMessage';
export type StxSignStructuredMessageRequestMethodName = typeof stxSignStructuredMessageMethodName;

// Request
export const stxSignStructuredMessageRequestParamsSchema = z.object({
  domain: z.string(),
  message: z.string(),
});
export type StxSignStructuredMessageRequestParams = z.infer<
  typeof stxSignStructuredMessageRequestParamsSchema
>;

export const stxSignStructuredMessageRequestSchema = createRpcRequestSchema(
  stxSignStructuredMessageMethodName,
  stxSignStructuredMessageRequestParamsSchema
);
export type StxSignStructuredMessageRequest = z.infer<typeof stxSignStructuredMessageRequestSchema>;

// Result
export const stxSignStructuredMessageResponseBodySchema = z.object({
  signature: z.string(),
  publicKey: z.string(),
});

export const stxSignStructuredMessageResponseSchema = createRpcResponseSchema(
  stxSignStructuredMessageResponseBodySchema,
  defaultErrorSchema
);
export type StxSignStructuredMessageResponse = z.infer<
  typeof stxSignStructuredMessageResponseSchema
>;

export type DefineStxSignStructuredMessageMethod = DefineRpcMethod<
  StxSignStructuredMessageRequest,
  StxSignStructuredMessageResponse
>;
