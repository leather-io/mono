import { AverageBitcoinFeeRates, UtxoItem } from '@leather-wallet/models';
import { createMoney, satToBtc } from '@leather-wallet/utils';
import BigNumber from 'bignumber.js';

import { filterUneconomicalUtxos, getSpendableAmount } from '../utils';

interface CalculateMaxBitcoinSpend {
  address: string;
  utxos: UtxoItem[];
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
    address,
  });

  const { spendableAmount, fee } = getSpendableAmount({
    utxos: filteredUtxos,
    feeRate: currentFeeRate,
    address,
  });

  return {
    spendAllFee: fee,
    amount: createMoney(spendableAmount, 'BTC'),
    spendableBitcoin: satToBtc(spendableAmount),
  };
}
