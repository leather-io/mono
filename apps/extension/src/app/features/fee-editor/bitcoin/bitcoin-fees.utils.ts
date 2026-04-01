import {
  type DetermineUtxosForSpendArgs,
  determineUtxosForSpend,
  determineUtxosForSpendAll,
} from '@leather.io/bitcoin';
import type { OwnedUtxo } from '@leather.io/models';

export function getBitcoinFee(determineUtxosForFeeArgs: DetermineUtxosForSpendArgs<OwnedUtxo>) {
  try {
    const { fee } = determineUtxosForSpend(determineUtxosForFeeArgs);
    return fee;
  } catch {
    return null;
  }
}

export function getBitcoinSendMaxFee(
  determineUtxosForFeeArgs: DetermineUtxosForSpendArgs<OwnedUtxo>
) {
  try {
    const { fee } = determineUtxosForSpendAll(determineUtxosForFeeArgs);
    return fee;
  } catch {
    return null;
  }
}
