import { useMemo } from 'react';

import { getErrorMessages } from '@/features/send/error-messages';
import { CalculateBtcMaxSpend } from '@/features/send/hooks/use-calculate-btc-max-spend';
import { addressComplianceValidator } from '@/features/send/utils';
import * as z from 'zod';

import {
  isBtcBalanceSufficient,
  isBtcMinimumSpend,
  isValidBitcoinAddress,
  isValidBitcoinNetworkAddress,
} from '@leather.io/bitcoin';
import { BTC_DECIMALS } from '@leather.io/constants';
import { BitcoinNetworkModes } from '@leather.io/models';
import { countDecimals, createMoneyFromDecimal } from '@leather.io/utils';

interface SchemaCreationParams {
  networkMode: BitcoinNetworkModes;
  calculateBtcMaxSpend: CalculateBtcMaxSpend;
}

export function useBtcSendFormSchema({ networkMode, calculateBtcMaxSpend }: SchemaCreationParams) {
  return useMemo(
    () => createBtcSendFormSchema({ networkMode, calculateBtcMaxSpend }),
    [networkMode, calculateBtcMaxSpend]
  );
}

function createBtcSendFormSchema({ networkMode, calculateBtcMaxSpend }: SchemaCreationParams) {
  const errorMessages = getErrorMessages();

  return (
    z
      .object({
        amount: z
          .string()
          .refine(btcPrecisionValidator(), errorMessages.invalidPrecision(BTC_DECIMALS))
          .refine(
            withNumericStringValidation(btcMinimumSpendValidator()),
            errorMessages.minimumAmount
          ),
        recipient: z
          .string()
          .refine(isValidBitcoinAddress, errorMessages.invalidAddress)
          .refine(btcAddressNetworkValidator(networkMode), errorMessages.incorrectNetworkAddress)
          .refine(btcComplianceValidator(), errorMessages.nonCompliantAddress),
        feeRate: z.number(),
        isSendingMax: z.boolean(),
      })
      // Insufficient balance calculation is recipient-aware
      .superRefine(btcInsufficientBalanceValidator(calculateBtcMaxSpend))
  );
}

function btcPrecisionValidator() {
  return (amount: string) => countDecimals(amount) <= BTC_DECIMALS;
}

function btcMinimumSpendValidator() {
  return (amount: number) => isBtcMinimumSpend(createMoneyFromDecimal(amount, 'BTC'));
}

function btcAddressNetworkValidator(networkMode: BitcoinNetworkModes) {
  return (address: string) => isValidBitcoinNetworkAddress(address, networkMode);
}

function btcComplianceValidator() {
  return (address: string) =>
    addressComplianceValidator({
      address,
      shouldCheckCompliance: isValidBitcoinAddress(address),
    });
}

function btcInsufficientBalanceValidator(calculateBtcMaxSpend: CalculateBtcMaxSpend) {
  return (
    formValues: { recipient: string; amount: string; feeRate: number },
    context: z.RefinementCtx
  ) => {
    const { amount, feeRate, recipient } = formValues;

    if (
      !isBtcBalanceSufficient({
        desiredSpend: createMoneyFromDecimal(parseFloat(amount), 'BTC'),
        maxSpend: calculateBtcMaxSpend({ recipient, feeRate }).amount,
      })
    ) {
      context.addIssue({
        path: ['amount'],
        message: getErrorMessages().insufficientFunds,
        code: z.ZodIssueCode.custom,
      });
    }
  };
}

function withNumericStringValidation(check: (input: number) => boolean) {
  return (value: string) => {
    const numericInput = Number(value);
    if (isNaN(numericInput)) {
      return false;
    }
    return check(numericInput);
  };
}

export type BtcFormSchema = z.infer<ReturnType<typeof createBtcSendFormSchema>>;
