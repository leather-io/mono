import BigNumber from 'bignumber.js';

import type { Money } from '@leather.io/models';
import { createMoney, sumNumbers } from '@leather.io/utils';

import { SupportedPaymentType, inferPaymentTypeFromAddress } from '../utils/bitcoin.utils';
import { createBitcoinAddress } from '../validation/bitcoin-address';
import { InputData } from './coin-selection.utils';

export interface SpendSourcesSummary {
  nativeSegwit: Money;
  taproot: Money;
  nativeSegwitInputCount: number;
  taprootInputCount: number;
  inputCount: number;
}

function inferSpendSourceType(address: string): SupportedPaymentType | null {
  try {
    return inferPaymentTypeFromAddress(createBitcoinAddress(address));
  } catch {
    return null;
  }
}

function sumInputValues<T extends InputData>(inputs: T[]) {
  return createMoney(sumNumbers(inputs.map(input => input.value)), 'BTC');
}

export function summarizeSpendSources<T extends InputData>(inputs: T[]): SpendSourcesSummary {
  const nativeSegwitInputs = inputs.filter(
    input => inferSpendSourceType(input.address) === 'p2wpkh'
  );
  const taprootInputs = inputs.filter(input => inferSpendSourceType(input.address) === 'p2tr');

  return {
    nativeSegwit: sumInputValues(nativeSegwitInputs),
    taproot: sumInputValues(taprootInputs),
    nativeSegwitInputCount: nativeSegwitInputs.length,
    taprootInputCount: taprootInputs.length,
    inputCount: inputs.length,
  };
}

export interface SpendSourcesBreakdown {
  nativeSegwit: Money;
  taproot: Money;
}

export function breakDownSpendBySource(
  summary: SpendSourcesSummary,
  totalSpend: Money
): SpendSourcesBreakdown {
  const taproot = BigNumber.max(BigNumber.min(summary.taproot.amount, totalSpend.amount), 0);
  const nativeSegwit = BigNumber.max(
    BigNumber.min(summary.nativeSegwit.amount, totalSpend.amount.minus(taproot)),
    0
  );

  return {
    nativeSegwit: createMoney(nativeSegwit, 'BTC'),
    taproot: createMoney(taproot, 'BTC'),
  };
}
