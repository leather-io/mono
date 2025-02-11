import { z } from 'zod';

import {
  DefineRpcMethod,
  createRpcRequestSchema,
  createRpcResponseSchema,
  defaultErrorSchema,
} from '../rpc/schemas';

const methodName = 'openSwap';

// Request
export const openSwapRequestParamsSchema = z.object({
  base: z.string(),
  quote: z.string(),
});
export type OpenSwapRequestParams = z.infer<typeof openSwapRequestParamsSchema>;

export const openSwapRequestSchema = createRpcRequestSchema(
  methodName,
  openSwapRequestParamsSchema
);
export type OpenSwapRequest = z.infer<typeof openSwapRequestSchema>;

// Response
export const openSwapResponseBodySchema = z.object({
  message: z.string(),
});
export type OpenSwapResponseBody = z.infer<typeof openSwapRequestParamsSchema>;

export const openSwapResponseSchema = createRpcResponseSchema(
  openSwapResponseBodySchema,
  defaultErrorSchema
);
export type OpenSwapResponse = z.infer<typeof openSwapResponseSchema>;

export type DefineOpenSwapMethod = DefineRpcMethod<OpenSwapRequest, OpenSwapResponse>;
