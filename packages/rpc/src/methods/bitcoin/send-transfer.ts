import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

export const rpcSendTransferLegacyParamSchema = z.object({
  account: z.number().optional(),
  address: z.string(),
  amount: z.coerce.string(),
  network: z.string(),
});
export type RpcSendTransferLegacyParams = z.infer<typeof rpcSendTransferLegacyParamSchema>;

const transferRecipientParamSchema = z.object({
  address: z.string(),
  amount: z.coerce.string(),
});

export const rpcSendTransferNewParamsSchema = z.object({
  account: z.number().optional(),
  recipients: z.array(transferRecipientParamSchema),
  network: z.string(),
});
export type RpcSendTransferParams = z.infer<typeof rpcSendTransferNewParamsSchema>;

export const rpcSendTransferParamsSchema = z.union([
  rpcSendTransferLegacyParamSchema,
  rpcSendTransferNewParamsSchema,
]);

export const sendTransfer = defineRpcEndpoint({
  method: 'sendTransfer',
  params: rpcSendTransferParamsSchema,
  result: z.object({
    txid: z.string(),
  }),
});
