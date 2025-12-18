import BigNumber from 'bignumber.js';

import type { Money } from '@leather.io/models';
import { createMoney, satToBtc } from '@leather.io/utils';

import { filterUneconomicalUtxos, getSpendableAmount } from './coin-selection.utils';

interface CalculateMaxSpendParams {
  recipient: string;
  utxos: { value: number; txid: string }[];
  feeRate: number;
}

export interface CalculateMaxSpendResponse {
  spendAllFee: number;
  amount: Money;
  spendableBitcoin: BigNumber;
}
export function calculateMaxSpend({
  recipient,
  utxos,
  feeRate,
}: CalculateMaxSpendParams): CalculateMaxSpendResponse {
  if (!utxos.length)
    return {
      spendAllFee: 0,
      amount: createMoney(0, 'BTC'),
      spendableBitcoin: new BigNumber(0),
    };

  const filteredUtxos = filterUneconomicalUtxos({
    utxos,
    feeRate,
    recipients: [{ address: recipient, amount: createMoney(0, 'BTC') }],
  });

  const { spendableAmount, fee } = getSpendableAmount({
    utxos: filteredUtxos,
    feeRate,
    recipients: [{ address: recipient, amount: createMoney(0, 'BTC') }],
    isSendMax: true,
  });

  return {
    spendAllFee: fee,
    amount: createMoney(spendableAmount, 'BTC'),
    spendableBitcoin: satToBtc(spendableAmount),
  };
}
