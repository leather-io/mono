import BigNumber from 'bignumber.js';

import { filterUneconomicalUtxos, getSpendableAmount } from '@leather.io/bitcoin';
import type { OwnedUtxo } from '@leather.io/models';
import { createMoney, satToBtc } from '@leather.io/utils';

interface CalculateMaxBitcoinSpend {
  address: string;
  utxos: OwnedUtxo[];
  defaultFeeRate?: number;
  feeRate?: number;
}

export function calculateMaxBitcoinSpend({
  address,
  utxos,
  feeRate,
  defaultFeeRate,
}: CalculateMaxBitcoinSpend) {
  if (!utxos.length || !defaultFeeRate)
    return {
      spendAllFee: 0,
      amount: createMoney(0, 'BTC'),
      spendableBitcoin: new BigNumber(0),
    };

  const currentFeeRate = feeRate ?? defaultFeeRate;

  const filteredUtxos = filterUneconomicalUtxos({
    utxos,
    feeRate: currentFeeRate,
    recipients: [{ address, amount: createMoney(0, 'BTC') }],
  });

  const { spendableAmount, fee } = getSpendableAmount({
    utxos: filteredUtxos,
    feeRate: currentFeeRate,
    recipients: [{ address, amount: createMoney(0, 'BTC') }],
    isSendMax: true,
  });

  return {
    spendAllFee: fee,
    amount: createMoney(spendableAmount, 'BTC'),
    spendableBitcoin: satToBtc(spendableAmount),
  };
}
