import type { Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { BitcoinError } from '../validation/bitcoin-error';
import {
  type CoinSelectionRecipient,
  type DetermineUtxosForSpendArgs,
  determineUtxosForSpend,
  determineUtxosForSpendAll,
} from './coin-selection';
import {
  type InputData,
  type InputSizing,
  filterUneconomicalUtxos,
  getSpendableAmount,
} from './coin-selection.utils';

interface CalculateMaxSpendWithinInputLimitArgs<T extends InputData> {
  recipient: string;
  utxos: T[];
  feeRate: number;
  maxInputs: number;
  inputSizing?: InputSizing;
}

export interface CalculateMaxSpendWithinInputLimitResponse {
  amount: Money;
  fee: number;
  inputCount: number;
  economicalInputCount: number;
}

export function calculateMaxSpendWithinInputLimit<T extends InputData>({
  recipient,
  utxos,
  feeRate,
  maxInputs,
  inputSizing,
}: CalculateMaxSpendWithinInputLimitArgs<T>): CalculateMaxSpendWithinInputLimitResponse {
  if (!utxos.length || feeRate <= 0 || maxInputs <= 0)
    return { amount: createMoney(0, 'BTC'), fee: 0, inputCount: 0, economicalInputCount: 0 };

  const recipients: CoinSelectionRecipient[] = [
    { address: recipient, amount: createMoney(0, 'BTC') },
  ];

  const economicalUtxos = filterUneconomicalUtxos({ utxos, feeRate, recipients, inputSizing });

  const limitedUtxos = [...economicalUtxos].sort((a, b) => b.value - a.value).slice(0, maxInputs);

  const { spendableAmount, fee } = getSpendableAmount({
    utxos: limitedUtxos,
    feeRate,
    recipients,
    isSendMax: false,
    inputSizing,
  });

  return {
    amount: createMoney(spendableAmount, 'BTC'),
    fee,
    inputCount: limitedUtxos.length,
    economicalInputCount: economicalUtxos.length,
  };
}

interface CountUtxosForSpendArgs<T extends InputData> extends DetermineUtxosForSpendArgs<T> {
  isSendMax?: boolean;
}

export function countUtxosForSpend<T extends InputData>({
  isSendMax,
  utxos,
  ...args
}: CountUtxosForSpendArgs<T>): number | null {
  const selectionArgs = { ...args, utxos: [...utxos] };

  try {
    const { inputs } = isSendMax
      ? determineUtxosForSpendAll(selectionArgs)
      : determineUtxosForSpend(selectionArgs);
    return inputs.length;
  } catch (error) {
    if (error instanceof BitcoinError) return null;
    throw error;
  }
}
