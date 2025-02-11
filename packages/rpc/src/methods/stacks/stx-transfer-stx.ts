import { z } from 'zod';

import {
  DefineRpcMethod,
  createRpcRequestSchema,
  createRpcResponseSchema,
  defaultErrorSchema,
} from '../../rpc/schemas';
import {
  baseStacksTransactionConfigSchema,
  stacksTransactionDetailsSchema,
} from './_stacks-helpers';

export const stxTransferStxMethodName = 'stx_transferStx';
export type StxTransferStxRequestMethodName = typeof stxTransferStxMethodName;

// Request
export const stxTransferStxRequestParamsSchema = z.intersection(
  z.object({
    recipient: z.string(),
    amount: z.coerce.number(),
    memo: z.string().optional(),
  }),
  baseStacksTransactionConfigSchema
);
export type StxTransferStxRequestParams = z.infer<typeof stxTransferStxRequestParamsSchema>;

export const stxTransferStxRequestSchema = createRpcRequestSchema(
  stxTransferStxMethodName,
  stxTransferStxRequestParamsSchema
);
export type StxTransferStxRequest = z.infer<typeof stxTransferStxRequestSchema>;

// Result
export const stxTransferStxResponseBodySchema = stacksTransactionDetailsSchema;

export const stxTransferStxResponseSchema = createRpcResponseSchema(
  stxTransferStxResponseBodySchema,
  defaultErrorSchema
);
type StxTransferStxResponse = z.infer<typeof stxTransferStxResponseSchema>;

export type DefineStxTransferStxMethod = DefineRpcMethod<
  StxTransferStxRequest,
  StxTransferStxResponse
>;
