import BigNumber from 'bignumber.js';

import type { AverageBitcoinFeeRates, Money } from '@leather.io/models';
import { createMoney, satToBtc } from '@leather.io/utils';

import { filterUneconomicalUtxos, getSpendableAmount } from './coin-selection.utils';

interface CalculateMaxSpendArgs {
  // recipient is intentionally string instead of BitcoinAddress, as it's being validated
  // with a fallback in a subroutine.
  recipient: string;
  utxos: { value: number; txid: string }[];
  feeRates?: AverageBitcoinFeeRates;
  feeRate?: number;
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
  feeRates,
}: CalculateMaxSpendArgs): CalculateMaxSpendResponse {
  if (!utxos.length || !feeRates)
    return {
      spendAllFee: 0,
      amount: createMoney(0, 'BTC'),
      spendableBitcoin: new BigNumber(0),
    };

  const currentFeeRate = feeRate ?? feeRates.halfHourFee.toNumber();

  const filteredUtxos = filterUneconomicalUtxos({
    utxos,
    feeRate: currentFeeRate,
    recipients: [{ address: recipient, amount: createMoney(0, 'BTC') }],
  });

  const { spendableAmount, fee } = getSpendableAmount({
    utxos: filteredUtxos,
    feeRate: currentFeeRate,
    recipients: [{ address: recipient, amount: createMoney(0, 'BTC') }],
    isSendMax: true,
  });

  return {
    spendAllFee: fee,
    amount: createMoney(spendableAmount, 'BTC'),
    spendableBitcoin: satToBtc(spendableAmount),
  };
}
