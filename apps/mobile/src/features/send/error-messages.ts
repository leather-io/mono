import { i18n } from '@lingui/core';

import { minSpendAmountInSats } from '@leather.io/bitcoin';
import { satToBtc } from '@leather.io/utils';

export const errorMessages = {
  notANumber: i18n._({
    id: 'send.validation.not_a_number',
    message: 'Not a number',
  }),
  notAPositiveNumber: i18n._({
    id: 'send.validation.greater_than_zero',
    message: 'Amount must be greater than zero',
  }),
  invalidPrecision: (decimals: number) =>
    i18n._({
      id: 'send.validation.invalid_precision',
      message: 'Token can only have {precision} decimals',
      values: { precision: decimals },
    }),
  minimumAmount: i18n._({
    id: 'send.validation.minimum_amount',
    message: `Minimum is {minSpendAmountInSats}`,
    values: { minSpendAmountInSats: satToBtc(minSpendAmountInSats) },
  }),
  insufficientFunds: i18n._({
    id: 'send.validation.insufficient_funds',
    message: 'Insufficient funds',
  }),
  invalidAddress: i18n._({
    id: 'send.validation.invalid_address',
    message: 'Address is not valid',
  }),
  incorrectNetworkAddress: i18n._({
    id: 'send.validation.invalid_network',
    message: 'Address is for incorrect network',
  }),
  nonCompliantAddress: i18n._({
    id: 'send.validation.non_compliant_address',
    message: 'Compliance check failed',
  }),
  recipientIsPayer: i18n._({
    id: 'send.validation.cannot_send_to_yourself',
    message: 'Cannot send to yourself',
  }),
  memoExceedsLimit: i18n._({
    id: 'send.validation.memo_exceeds_limit',
    message: 'Memo must be less than 34-bytes',
  }),
} as const;
