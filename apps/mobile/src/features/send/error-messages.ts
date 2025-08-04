import { t } from '@lingui/core/macro';

import { minSpendAmountInSats } from '@leather.io/bitcoin';
import { satToBtc } from '@leather.io/utils';

const minimumBtcSpendAmount = satToBtc(minSpendAmountInSats).toString();

export function getErrorMessages() {
  return {
    notANumber: t`Not a number`,
    notAPositiveNumber: t`Amount must be greater than zero`,
    invalidPrecision: (decimals: number) => t`Token can only have ${decimals} decimals`,
    minimumAmount: t`Minimum is ${minimumBtcSpendAmount}`,
    insufficientFunds: t`Insufficient funds`,
    invalidAddress: t`Address is not valid`,
    incorrectNetworkAddress: t`Address is for incorrect network`,
    nonCompliantAddress: t`Compliance check failed`,
    recipientIsPayer: t`Cannot send to yourself`,
    memoExceedsLimit: t`Memo must be less than 34-bytes`,
  } as const;
}
