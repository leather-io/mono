import {
  type InputSizing,
  calculateMaxSpendWithinInputLimit,
  countUtxosForSpend,
} from '@leather.io/bitcoin';
import { LEDGER_BITCOIN_MAX_INPUTS } from '@leather.io/constants';
import type { Money, OwnedUtxo } from '@leather.io/models';

import type { TransferRecipient } from '@shared/models/form.model';

export interface LedgerBitcoinInputLimit {
  inputCount: number | null;
  exceedsLimit: boolean;
  maxAmountWithinLimit: Money | null;
}

export const emptyLedgerBitcoinInputLimit: LedgerBitcoinInputLimit = {
  inputCount: null,
  exceedsLimit: false,
  maxAmountWithinLimit: null,
};

interface GetLedgerBitcoinInputLimitArgs {
  utxos: OwnedUtxo[];
  recipients: TransferRecipient[];
  feeRate?: number;
  isSendingMax?: boolean;
  inputSizing?: InputSizing;
}

export function getLedgerBitcoinInputLimit({
  utxos,
  recipients,
  feeRate,
  isSendingMax,
  inputSizing,
}: GetLedgerBitcoinInputLimitArgs): LedgerBitcoinInputLimit {
  if (!feeRate || !utxos.length) return emptyLedgerBitcoinInputLimit;

  const hasAmount = recipients.some(recipient => recipient.amount.amount.isGreaterThan(0));
  if (!isSendingMax && !hasAmount) return emptyLedgerBitcoinInputLimit;

  const inputCount = countUtxosForSpend({
    utxos,
    recipients,
    feeRate,
    inputSizing,
    isSendMax: isSendingMax,
  });
  if (inputCount === null) return emptyLedgerBitcoinInputLimit;

  const exceedsLimit = inputCount > LEDGER_BITCOIN_MAX_INPUTS;
  if (!exceedsLimit) return { inputCount, exceedsLimit, maxAmountWithinLimit: null };

  const { amount } = calculateMaxSpendWithinInputLimit({
    recipient: recipients.at(0)?.address ?? '',
    utxos,
    feeRate,
    maxInputs: LEDGER_BITCOIN_MAX_INPUTS,
    inputSizing,
  });

  return { inputCount, exceedsLimit, maxAmountWithinLimit: amount };
}

export function assertLedgerBitcoinInputLimit(inputCount: number) {
  if (inputCount <= LEDGER_BITCOIN_MAX_INPUTS) return;
  throw new Error(
    `Ledger can sign at most ${LEDGER_BITCOIN_MAX_INPUTS} inputs per transaction; this transaction has ${inputCount}`
  );
}
