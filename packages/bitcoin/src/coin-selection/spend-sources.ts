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
