import BigNumber from 'bignumber.js';
import { z } from 'zod';

import type { Money } from '@leather.io/models';
import { countDecimals, isFunction, isNumber, moneyToBaseUnit } from '@leather.io/utils';

// from extension/src/shared/error-messages
export enum FormErrorMessages {
  AdjustedFeeExceedsBalance = 'Fee added exceeds current balance',
  AddressRequired = 'Enter an address',
  AmountRequired = 'Enter an amount',
  BnsAddressNotFound = 'Address not found',
  CannotDetermineBalance = 'Cannot determine balance',
  CannotDeterminePrecision = 'Cannot determine decimal precision',
  CastToNumber = 'Amount must be a `number` type, but the final value was: `NaN`',
  DoesNotSupportDecimals = 'Token does not support decimal places',
  IncorrectNetworkAddress = 'Address is for incorrect network',
  InvalidAddress = 'Address is not valid',
  InsufficientBalance = 'Insufficient balance. Available:',
  InsufficientFunds = 'Insufficient funds',
  MemoExceedsLimit = 'Memo must be less than 34-bytes',
  MustBeNumber = 'Amount must be a number',
  MustBePositive = 'Amount must be greater than zero',
  MustSelectAsset = 'Select a valid token to transfer',
  SameAddress = 'Cannot send to yourself',
  TooMuchPrecision = 'Token can only have {decimals} decimals',
  NonZeroOffsetInscription = 'Sending inscriptions at non-zero offsets is unsupported',
  UtxoWithMultipleInscriptions = 'Sending inscription from utxo with multiple inscriptions is unsupported',
  InsufficientFundsToCoverFee = 'Insufficient funds to cover fee. Deposit some BTC to your Native Segwit address.',
}

export function currencyAmountValidator() {
  return z
    .number({
      // FIXME: LEA-1647 - move to packages
      /* eslint-disable-next-line lingui/no-unlocalized-strings  */
      invalid_type_error: 'Currency must be a number',
    })
    .positive(FormErrorMessages.MustBePositive);
}

export function currencyPrecisionValidatorFactory(precision: number, errorMessage: string) {
  return z
    .number({
      required_error: FormErrorMessages.AmountRequired,
      invalid_type_error: FormErrorMessages.MustBeNumber,
    })
    .refine(
      value => {
        if (!isNumber(value)) return false;
        return countDecimals(value) <= precision;
      },
      {
        message: errorMessage,
      }
    );
}

export function formatPrecisionError(num?: Money) {
  if (!num) return FormErrorMessages.CannotDeterminePrecision;
  const error = FormErrorMessages.TooMuchPrecision;
  return error.replace('{decimals}', String(num.decimals));
}

export function formatInsufficientBalanceError(
  sum?: Money,
  formatterFn?: (amount: Money) => string
) {
  if (!sum) return FormErrorMessages.CannotDetermineBalance;
  const isAmountLessThanZero = sum.amount.lt(0);

  const formattedAmount = isFunction(formatterFn) ? formatterFn(sum) : sum.amount.toString(10);

  return `${FormErrorMessages.InsufficientBalance} ${
    isAmountLessThanZero ? '0' : formattedAmount
  } ${sum.symbol}`;
}

interface FeeValidatorFactoryArgs {
  availableBalance?: Money;
  unitConverter(unit: string | number | BigNumber): BigNumber;
  validator(errorMsg: string): z.ZodType<number | undefined>;
}
export function feeValidatorFactory({
  availableBalance,
  unitConverter,
  validator,
}: FeeValidatorFactoryArgs) {
  return validator(formatPrecisionError(availableBalance)).refine(
    (fee: unknown) => {
      if (!availableBalance || !isNumber(fee)) return false;
      return availableBalance.amount.isGreaterThanOrEqualTo(unitConverter(fee));
    },
    {
      message: formatInsufficientBalanceError(availableBalance, sum =>
        moneyToBaseUnit(sum).toString()
      ),
    }
  );
}

// <<<< PETE continue here migrating the fee stuff
// - then move them to packages to avoid the stupid lingui errors
