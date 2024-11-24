import BigNumber from 'bignumber.js';

import type { AverageBitcoinFeeRates } from '@leather.io/models';
import { createMoney, satToBtc } from '@leather.io/utils';

import { CoinSelectionUtxo } from './coin-selection';
import { filterUneconomicalUtxos, getSpendableAmount } from './coin-selection.utils';

interface CalculateMaxBitcoinSpend {
  address: string;
  utxos: CoinSelectionUtxo[];
  fetchedFeeRates?: AverageBitcoinFeeRates;
  feeRate?: number;
}

export function calculateMaxBitcoinSpend({
  address,
  utxos,
  feeRate,
  fetchedFeeRates,
}: CalculateMaxBitcoinSpend) {
  if (!utxos.length || !fetchedFeeRates)
    return {
      spendAllFee: 0,
      amount: createMoney(0, 'BTC'),
      spendableBitcoin: new BigNumber(0),
    };

  const currentFeeRate = feeRate ?? fetchedFeeRates.halfHourFee.toNumber();

  const filteredUtxos = filterUneconomicalUtxos({
    utxos,
    feeRate: currentFeeRate,
    recipients: [{ address, amount: createMoney(0, 'BTC') }],
  });

  const { spendableAmount, fee } = getSpendableAmount({
    utxos: filteredUtxos,
    feeRate: currentFeeRate,
    recipients: [{ address, amount: createMoney(0, 'BTC') }],
  });

  return {
    spendAllFee: fee,
    amount: createMoney(spendableAmount, 'BTC'),
    spendableBitcoin: satToBtc(spendableAmount),
  };
}
