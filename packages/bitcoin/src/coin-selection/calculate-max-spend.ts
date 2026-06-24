import BigNumber from 'bignumber.js';

import type { Money } from '@leather.io/models';
import { createMoney, satToBtc } from '@leather.io/utils';

import {
  type InputData,
  type InputSizing,
  filterUneconomicalUtxos,
  getSpendableAmount,
} from './coin-selection.utils';

interface CalculateMaxSpendParams {
  recipient: string;
  utxos: InputData[];
  feeRate: number;
  inputSizing?: InputSizing;
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
  inputSizing,
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
    inputSizing,
  });

  const { spendableAmount, fee } = getSpendableAmount({
    utxos: filteredUtxos,
    feeRate,
    recipients: [{ address: recipient, amount: createMoney(0, 'BTC') }],
    isSendMax: true,
    inputSizing,
  });

  return {
    spendAllFee: fee,
    amount: createMoney(spendableAmount, 'BTC'),
    spendableBitcoin: satToBtc(spendableAmount),
  };
}
