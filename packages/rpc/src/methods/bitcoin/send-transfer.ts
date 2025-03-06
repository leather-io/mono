import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

const sendTransferLegacyParamSchema = z.object({
  account: z.number().optional(),
  address: z.string(),
  amount: z.coerce.string(),
  network: z.string(),
});
export type RpcSendTransferLegacyParams = z.infer<typeof sendTransferLegacyParamSchema>;

const transferRecipientParamSchema = z.object({
  address: z.string(),
  amount: z.coerce.string(),
});

const rpcSendTransferParamsSchema = z.object({
  account: z.number().optional(),
  recipients: z.array(transferRecipientParamSchema),
  network: z.string(),
});
export type RpcSendTransferParams = z.infer<typeof rpcSendTransferParamsSchema>;

export const sendTransfer = defineRpcEndpoint({
  method: 'sendTransfer',
  params: z.union([sendTransferLegacyParamSchema, rpcSendTransferParamsSchema]),
  result: z.object({
    txid: z.string(),
  }),
});
