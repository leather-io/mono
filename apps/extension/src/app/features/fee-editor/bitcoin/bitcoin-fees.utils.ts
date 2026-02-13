import {
  type DetermineUtxosForSpendArgs,
  determineUtxosForSpend,
  determineUtxosForSpendAll,
  getSizeInfo,
} from '@leather.io/bitcoin';
import type { OwnedUtxo } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import type { TransferRecipient } from '@shared/models/form.model';

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

export function getApproximateFee({
  feeRate,
  recipients,
  utxos,
}: {
  feeRate: number;
  recipients: TransferRecipient[];
  utxos: OwnedUtxo[];
}) {
  const size = getSizeInfo({
    utxos,
    recipients,
  });
  return createMoney(Math.ceil(size.txVBytes * feeRate), 'BTC');
}
