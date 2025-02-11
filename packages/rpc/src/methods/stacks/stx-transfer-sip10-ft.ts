import { z } from 'zod';

import {
  DefineRpcMethod,
  createRpcRequestSchema,
  createRpcResponseSchema,
  defaultErrorSchema,
} from '../../rpc/schemas';
import { stacksTransactionDetailsSchema } from './_stacks-helpers';

export const stxTransferSip10FtMethodName = 'stx_transferSip10Ft';

export type StxTransferSip10FtRequestMethodName = typeof stxTransferSip10FtMethodName;

// Request
export const stxTransferSip10FtRequestParamsSchema = z.object({
  recipient: z.string(),
  asset: z.string(),
  amount: z.coerce.number(),
});
export type StxTransferSip10FtRequestParams = z.infer<typeof stxTransferSip10FtRequestParamsSchema>;

export const stxTransferSip10FtRequestSchema = createRpcRequestSchema(
  stxTransferSip10FtMethodName,
  stxTransferSip10FtRequestParamsSchema
);
export type StxTransferSip10FtRequest = z.infer<typeof stxTransferSip10FtRequestSchema>;

// Result
export const stxTransferSip10FtResponseBodySchema = stacksTransactionDetailsSchema;

export const stxTransferSip10FtResponseSchema = createRpcResponseSchema(
  stxTransferSip10FtResponseBodySchema,
  defaultErrorSchema
);
export type StxTransferSip10FtResponse = z.infer<typeof stxTransferSip10FtResponseSchema>;

export type DefineStxTransferSip10FtMethod = DefineRpcMethod<
  StxTransferSip10FtRequest,
  StxTransferSip10FtResponse
>;
