import { z } from 'zod';

import {
  DefineRpcMethod,
  createRpcRequestSchema,
  createRpcResponseSchema,
  defaultErrorSchema,
} from '../../rpc/schemas';

export const stxSignMessageMethodName = 'stx_signMessage';

// Request
export const stxSignMessageTypeSchema = z.enum(['utf8', 'structured']);
export type StxSignMessageTypes = z.infer<typeof stxSignMessageTypeSchema>;

export const stxSignMessageRequestBaseSchema = z.object({
  messageType: stxSignMessageTypeSchema,
  network: z.optional(z.enum(['mainnet', 'testnet', 'devnet', 'mocknet'])),
});
export type StxSignMessageRequestParamsBase = z.infer<typeof stxSignMessageRequestBaseSchema>;

export const stxSignMessageRequestUtf8Schema = stxSignMessageRequestBaseSchema.merge(
  z.object({
    messageType: z.literal('utf8'),
    message: z.string(),
  })
);
export type StxSignMessageRequestParamsUtf8 = z.infer<typeof stxSignMessageRequestUtf8Schema>;

export const stxSignMessageRequestStructuredSchema = stxSignMessageRequestBaseSchema.merge(
  z.object({
    messageType: z.literal('structured'),
    domain: z.string(),
    message: z.string(),
  })
);
export type StxSignMessageRequestParamsStructured = z.infer<
  typeof stxSignMessageRequestStructuredSchema
>;

export const stxSignMessageRequestParamsSchema = z.union([
  stxSignMessageRequestUtf8Schema,
  stxSignMessageRequestStructuredSchema,
]);
export type StxSignMessageRequestParams = z.infer<typeof stxSignMessageRequestParamsSchema>;

export const stxSignMessageRequestSchema = createRpcRequestSchema(
  stxSignMessageMethodName,
  stxSignMessageRequestParamsSchema
);
export type StxSignMessageRequest = z.infer<typeof stxSignMessageRequestSchema>;

// Response
export const stxSignMessageResponseBodySchema = z.object({
  signature: z.string(),
  publicKey: z.string(),
});
export type StxSignMessageResponseBodySchema = z.infer<typeof stxSignMessageResponseBodySchema>;

export const stxSignMessageResponseSchema = createRpcResponseSchema(
  stxSignMessageResponseBodySchema,
  defaultErrorSchema
);

export type StxSignMessageResponse = z.infer<typeof stxSignMessageResponseSchema>;

export type DefineStxSignMessageMethod = DefineRpcMethod<
  StxSignMessageRequest,
  StxSignMessageResponse
>;
