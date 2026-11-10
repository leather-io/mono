import BigNumber from 'bignumber.js';
import { z } from 'zod';

import { isBtcBalanceSufficient, isBtcMinimumSpend } from '@leather.io/bitcoin';
import { BITCOIN_MINIMUM_SPEND_IN_SATS } from '@leather.io/constants';
import type { Money, OwnedUtxo } from '@leather.io/models';
import {
  convertAmountToBaseUnit,
  countDecimals,
  createMoneyFromDecimal,
  isNumber,
  satToBtc,
  stxToMicroStx,
} from '@leather.io/utils';

import { FormErrorMessages } from '@shared/error-messages';
import { numberField, parseNumberString, requiredNumberField } from '@shared/forms/field-schemas';
import { analytics } from '@shared/utils/analytics';

import { formatCurrency } from '@app/common/currency-formatter';

import { formatInsufficientBalanceError, formatPrecisionError } from '../../error-formatters';
import { currencyAmountValidator, stxAmountPrecisionValidator } from './currency-validators';

function getFeeFromFormValues(formValues: unknown): string | number | BigNumber {
  if (typeof formValues !== 'object' || formValues === null || !('fee' in formValues)) {
    return Number.NaN;
  }
  const { fee } = formValues;
  if (typeof fee === 'string') return parseNumberString(fee);
  if (typeof fee === 'number' || BigNumber.isBigNumber(fee)) return fee;
  return Number.NaN;
}

function amountValidator() {
  return requiredNumberField({
    requiredError: FormErrorMessages.AmountRequired,
    typeError: 'Amount must be a number',
  }).check(currencyAmountValidator());
}

interface BtcInsufficientBalanceValidatorArgs {
  calcMaxSpend(
    recipient: string,
    utxos: OwnedUtxo[]
  ): {
    amount: Money;
  };
  recipient: string;
  utxos: OwnedUtxo[];
}
export function btcInsufficientBalanceValidator({
  calcMaxSpend,
  recipient,
  utxos,
}: BtcInsufficientBalanceValidatorArgs) {
  return z.refine<number | undefined>(
    value => {
      if (!value) return false;
      const maxSpend = calcMaxSpend(recipient, utxos);
      if (!maxSpend) return false;
      return isBtcBalanceSufficient({
        desiredSpend: createMoneyFromDecimal(value, 'BTC'),
        maxSpend: maxSpend.amount,
      });
    },
    { error: FormErrorMessages.InsufficientFunds }
  );
}

export function btcMinimumSpendValidator() {
  return z.refine<number | undefined>(
    value => {
      if (!value) return false;
      return isBtcMinimumSpend(createMoneyFromDecimal(value, 'BTC'));
    },
    { error: `Minimum is ${satToBtc(BITCOIN_MINIMUM_SPEND_IN_SATS).toString()}` }
  );
}

export function stxAmountValidator(availableStxBalance: Money) {
  return numberField(FormErrorMessages.MustBeNumber).check(
    currencyAmountValidator(),
    stxAmountPrecisionValidator(formatPrecisionError(availableStxBalance))
  );
}

export function stxAvailableBalanceValidator(availableBalance: Money, formValues: unknown) {
  const insufficientBalanceError = formatInsufficientBalanceError(availableBalance, formatCurrency);
  return z.superRefine<number | undefined>((value, ctx) => {
    const fee = new BigNumber(stxToMicroStx(getFeeFromFormValues(formValues)));
    if (!fee.isFinite()) {
      analytics.track('unable_to_read_fee_in_stx_validator');
      ctx.addIssue('Unable to read current fee');
      return;
    }
    if (!isNumber(value)) {
      ctx.addIssue(insufficientBalanceError);
      return;
    }
    if (!availableBalance) {
      analytics.track('unable_to_read_available_balance_in_stx_validator');
      ctx.addIssue('Available balance unknown');
      return;
    }
    const availableBalanceLessFee = availableBalance.amount.minus(fee);
    if (!availableBalanceLessFee.isGreaterThanOrEqualTo(stxToMicroStx(value))) {
      ctx.addIssue(insufficientBalanceError);
    }
  });
}

export function stacksFungibleTokenAmountValidator(balance: Money) {
  const { amount, decimals } = balance;

  return amountValidator().check(
    z.superRefine<number>((value, ctx) => {
      if (!decimals && countDecimals(value) > 0) {
        ctx.addIssue(FormErrorMessages.DoesNotSupportDecimals);
        return;
      }
      if (countDecimals(value) > decimals) {
        ctx.addIssue(formatPrecisionError(balance));
      }
    }),
    z.refine<number>(
      value => {
        if (!amount) return false;
        return new BigNumber(value).isLessThanOrEqualTo(convertAmountToBaseUnit(amount, decimals));
      },
      { error: formatInsufficientBalanceError(balance, formatCurrency) }
    )
  );
}
