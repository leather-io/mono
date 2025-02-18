import BigNumber from 'bignumber.js';
import { filterUneconomicalUtxos, getSpendableAmount } from 'coin-selection/coin-selection.utils';

import type { AverageBitcoinFeeRates, BitcoinAddress, Money } from '@leather.io/models';
import { createMoney, satToBtc } from '@leather.io/utils';

import { CoinSelectionUtxo } from '../coin-selection/coin-selection';

interface CalculateMaxSpendArgs {
  recipient: BitcoinAddress;
  utxos: CoinSelectionUtxo[];
  feeRates?: AverageBitcoinFeeRates;
  feeRate?: number;
}

interface CalculateMaxSpendResponse {
  spendAllFee: number;
  amount: Money;
  spendableBtc: BigNumber;
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
      spendableBtc: new BigNumber(0),
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
    spendableBtc: satToBtc(spendableAmount),
  };
}
