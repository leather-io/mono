import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc/schemas';

export const sendTransferRequestParamSchema = z.object({
  account: z.number().optional(),
  address: z.string(),
  amount: z.string(),
});

export const rpcSendTransferParamsLegacySchema = sendTransferRequestParamSchema.extend({
  network: z.string(),
});

export type SendTransferRequestParams = z.infer<typeof sendTransferRequestParamSchema>;

export type RpcSendTransferParamsLegacy = z.infer<typeof rpcSendTransferParamsLegacySchema>;

export const transferRecipientParamSchema = z.object({
  address: z.string(),
  amount: z.string(),
});

export type TransferRecipientParam = z.infer<typeof transferRecipientParamSchema>;

export const rpcSendTransferParamsSchema = z.object({
  account: z.number().optional(),
  recipients: z.array(transferRecipientParamSchema),
  network: z.string(),
});

export type RpcSendTransferParams = z.infer<typeof rpcSendTransferParamsSchema>;

export const sendTransferResponseBodySchema = z.object({
  txid: z.string(),
});

export type SendTransferResponseBody = z.infer<typeof sendTransferResponseBodySchema>;

export type SendTransferRequest = RpcRequest<
  'sendTransfer',
  SendTransferRequestParams | RpcSendTransferParams
>;

export type SendTransferResponse = RpcResponse<SendTransferResponseBody>;

export type DefineSendTransferMethod = DefineRpcMethod<SendTransferRequest, SendTransferResponse>;
