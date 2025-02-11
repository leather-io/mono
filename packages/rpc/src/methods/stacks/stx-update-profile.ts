import { z } from 'zod';

import {
  DefineRpcMethod,
  createRpcRequestSchema,
  createRpcResponseSchema,
  defaultErrorSchema,
} from '../../rpc/schemas';
import { stacksTransactionDetailsSchema } from './_stacks-helpers';

export const stxUpdateProfileMethodName = 'stx_updateProfile';

export type StxUpdateProfileRequestMethodName = typeof stxUpdateProfileMethodName;

// Request
export const stxUpdateProfileRequestParamsSchema = z.object({
  // schema.org/Person
  person: z.object({}).passthrough(),
});

export type StxUpdateProfileRequestParams = z.infer<typeof stxUpdateProfileRequestParamsSchema>;

export const stxUpdateProfileRequestSchema = createRpcRequestSchema(
  stxUpdateProfileMethodName,
  stxUpdateProfileRequestParamsSchema
);
export type StxUpdateProfileRequest = z.infer<typeof stxUpdateProfileRequestSchema>;

// Result
export const stxUpdateProfileResponseBodySchema = stacksTransactionDetailsSchema;

export const stxUpdateProfileResponseSchema = createRpcResponseSchema(
  stxUpdateProfileResponseBodySchema,
  defaultErrorSchema
);
export type StxUpdateProfileResponse = z.infer<typeof stxUpdateProfileResponseSchema>;

export type DefineStxUpdateProfileMethod = DefineRpcMethod<
  StxUpdateProfileRequest,
  StxUpdateProfileResponse
>;
