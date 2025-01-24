import BigNumber from 'bignumber.js';
import { z } from 'zod';

import { STX_DECIMALS } from '@leather.io/constants';
import type { Money } from '@leather.io/models';
import {
  convertAmountToBaseUnit,
  countDecimals,
  isFunction,
  isNumber,
  microStxToStx,
  stxToMicroStx,
} from '@leather.io/utils';

import {
  FormErrorMessages,
  currencyAmountValidator,
  currencyPrecisionValidatorFactory,
} from './common.validation';

// FIXME: This can easily just be currencyPrecisionValidatorFactory accepting STX_DECIMALS and string
export function stxAmountPrecisionValidator(errorMsg: string) {
  return currencyPrecisionValidatorFactory(STX_DECIMALS, errorMsg);
}

function formatPrecisionError(num?: Money) {
  if (!num) return FormErrorMessages.CannotDeterminePrecision;
  const error = FormErrorMessages.TooMuchPrecision;
  return error.replace('{decimals}', String(num.decimals));
}

function formatInsufficientBalanceError(sum?: Money, formatterFn?: (amount: Money) => string) {
  if (!sum) return FormErrorMessages.CannotDetermineBalance;
  const isAmountLessThanZero = sum.amount.lt(0);

  const formattedAmount = isFunction(formatterFn) ? formatterFn(sum) : sum.amount.toString(10);

  return `${FormErrorMessages.InsufficientBalance} ${
    isAmountLessThanZero ? '0' : formattedAmount
  } ${sum.symbol}`;
}

function amountValidator() {
  return z
    .number({
      required_error: FormErrorMessages.AmountRequired,
      // FIXME: LEA-1647 - move to packages
      /* eslint-disable-next-line lingui/no-unlocalized-strings  */
      invalid_type_error: 'Amount must be a number',
    })
    .positive(FormErrorMessages.MustBePositive);
}

export function stxAmountValidator(availableStxBalance: Money) {
  return z
    .number({
      invalid_type_error: FormErrorMessages.MustBeNumber,
    })
    .pipe(currencyAmountValidator())
    .pipe(stxAmountPrecisionValidator(formatPrecisionError(availableStxBalance)));
}
// TODO: test extensively as big refactor
// fee was previously inferred from this.parent.fee using yup
export function stxAvailableBalanceValidator(availableBalance: Money, fee: number) {
  return z
    .number({
      invalid_type_error: FormErrorMessages.MustBeNumber,
    })
    .refine(
      (value: number) => {
        const feeBigNumber = new BigNumber(stxToMicroStx(fee));
        if (!feeBigNumber.isFinite()) {
          //   void analytics.track('unable_to_read_fee_in_stx_validator');
          return false;
        }
        if (!isNumber(value)) return false;
        if (!availableBalance) {
          //   void analytics.track('unable_to_read_available_balance_in_stx_validator');
          return false;
        }
        const availableBalanceLessFee = availableBalance.amount.minus(fee);
        return availableBalanceLessFee.isGreaterThanOrEqualTo(stxToMicroStx(value));
      },
      {
        message: formatInsufficientBalanceError(availableBalance, sum =>
          microStxToStx(sum.amount).toString()
        ),
        params: {
          // FIXME: LEA-1647 - move to packages
          /* eslint-disable-next-line lingui/no-unlocalized-strings  */
          feeError: 'Unable to read current fee',
          // FIXME: LEA-1647 - move to packages
          /* eslint-disable-next-line lingui/no-unlocalized-strings  */
          balanceError: 'Available balance unknown',
        },
      }
    );
}

// TODO: test extensively as big refactor
// not urgent as no SIP-10 send support yet on mobile
export function stacksFungibleTokenAmountValidator(balance: Money) {
  const { amount, decimals } = balance;

  return amountValidator()
    .refine(
      value => {
        if (!isNumber(value)) return false;

        return true;
      },
      {
        message: FormErrorMessages.MustBeNumber,
      }
    )
    .refine(
      value => {
        if (decimals && countDecimals(value) > 0) return false;
        return true;
      },
      {
        message: FormErrorMessages.DoesNotSupportDecimals,
      }
    )
    .refine(
      value => {
        if (countDecimals(value) > decimals) return false;
        return true;
      },
      {
        message: formatPrecisionError(balance),
      }
    )
    .refine(
      value => {
        if (!isNumber(value) || !amount) return false;
        return new BigNumber(value).isLessThanOrEqualTo(convertAmountToBaseUnit(amount, decimals));
      },
      {
        message: formatInsufficientBalanceError(balance, sum =>
          microStxToStx(sum.amount).toString()
        ),
      }
    );
}
