import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';

import { countDecimals, isNumber } from '../index';

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

export function isValidPrecision(amount: number, precision: number) {
  if (!isNumber(amount)) return false;
  return countDecimals(amount) <= precision;
}

interface isValidTransactionAmountArgs {
  availableBalance?: Money;
  amount: number;
  fee: number;
  unitConverter(unit: string | number | BigNumber): BigNumber;
}

// taken logic from stxAvailableBalanceValidator
// this has replaced FeeValidator factory
// Pete type strings and return so we can then throw errors appropriately in UI
export function isValidTransactionAmount({
  availableBalance,
  amount,
  fee,
  unitConverter,
}: isValidTransactionAmountArgs) {
  if (!availableBalance) {
    // balanceError: 'Available balance unknown'
    //   void analytics.track('unable_to_read_available_balance_in_stx_validator');
    return false;
  }

  if (!fee || !isNumber(fee)) {
    // balanceError: 'Unable to read current fee'
    //   void analytics.track('unable_to_read_available_balance_in_stx_validator');
    return false;
  }

  // values should be passed in pre-converted? that's if Sharing with BTC
  const feeBigNumber = new BigNumber(unitConverter(fee));
  const value = amount; // TODO check this as it's unclear what it is
  if (!feeBigNumber.isFinite()) {
    //   void analytics.track('unable_to_read_fee_in_stx_validator');
    return false;
  }
  if (!isNumber(value)) return false;

  const availableBalanceLessFee = availableBalance.amount.minus(fee);
  return availableBalanceLessFee.isGreaterThanOrEqualTo(unitConverter(value));

  //   return true;
}
