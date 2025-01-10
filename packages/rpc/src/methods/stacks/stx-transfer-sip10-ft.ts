import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../../rpc/schemas';
import { stacksTransactionDetailsSchema } from './_stacks-helpers';

export const stxTransferSip10FtMethodName = 'stx_transferSip10Ft';

type StxTransferSip10FtRequestMethodName = typeof stxTransferSip10FtMethodName;

// Request
export const stxTransferSip10FtRequestParamsSchema = z.object({
  recipient: z.string(),
  asset: z.string(),
  amount: z.coerce.number(),
});

export type StxTransferSip10FtRequestParams = z.infer<typeof stxTransferSip10FtRequestParamsSchema>;

export type StxTransferSip10FtRequest = RpcRequest<
  StxTransferSip10FtRequestMethodName,
  StxTransferSip10FtRequestParams
>;

// Result
export const stxTransferSip10FtResponseBodySchema = stacksTransactionDetailsSchema;

export type StxTransferSip10FtResponse = RpcResponse<typeof stxTransferSip10FtResponseBodySchema>;

export type DefineStxTransferSip10FtMethod = DefineRpcMethod<
  StxTransferSip10FtRequest,
  StxTransferSip10FtResponse
>;
