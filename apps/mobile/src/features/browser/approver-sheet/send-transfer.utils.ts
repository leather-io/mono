import BigNumber from 'bignumber.js';

import { createBitcoinAddress } from '@leather.io/bitcoin';
import {
  RpcRequest,
  rpcSendTransferLegacyParamSchema,
  rpcSendTransferNewParamsSchema,
  sendTransfer,
} from '@leather.io/rpc';
import { createMoney } from '@leather.io/utils';

function createSatAmountMoney(amount: string) {
  const satAmount = new BigNumber(amount);
  if (!satAmount.isInteger())
    throw new Error('Send transfer amounts must be sat-denominated integers');
  return createMoney(satAmount, 'BTC');
}

export function getSendTransferRecipients(params: RpcRequest<typeof sendTransfer>['params']) {
  const parsedNewParams = rpcSendTransferNewParamsSchema.safeParse(params);
  const parsedLegacyParams = rpcSendTransferLegacyParamSchema.safeParse(params);

  if (parsedNewParams.success) {
    return parsedNewParams.data.recipients.map(rec => ({
      address: createBitcoinAddress(rec.address),
      amount: createSatAmountMoney(rec.amount),
    }));
  }
  if (parsedLegacyParams.success) {
    return [
      {
        address: createBitcoinAddress(parsedLegacyParams.data.address),
        amount: createSatAmountMoney(parsedLegacyParams.data.amount),
      },
    ];
  }
  throw new Error("Send transfer params don't pass zod validation");
}
