import { useMemo } from 'react';

import { getErrorMessages } from '@/features/send/error-messages';
import { CalculateStxMaxSpend } from '@/features/send/hooks/use-calculate-stx-max-spend';
import { addressComplianceValidator } from '@/features/send/utils';
import { ChainId } from '@stacks/network';
import * as z from 'zod';

import { STX_DECIMALS } from '@leather.io/constants';
import {
  isValidAddressChain,
  isValidStacksAddress,
  isValidStacksMemo,
  validatePayerNotRecipient,
} from '@leather.io/stacks';
import { isValidPrecision, stxToMicroStx } from '@leather.io/utils';

interface SchemaCreationParams {
  calculateStxMaxSpend: CalculateStxMaxSpend;
  payerAddress: string;
  chainId: number;
  assetDecimals?: number;
}

export function useStxSendFormSchema({
  calculateStxMaxSpend,
  payerAddress,
  chainId,
  assetDecimals,
}: SchemaCreationParams) {
  return useMemo(
    () => createStxSendFormSchema({ calculateStxMaxSpend, payerAddress, chainId, assetDecimals }),
    [calculateStxMaxSpend, payerAddress, chainId, assetDecimals]
  );
}

function createStxSendFormSchema({
  calculateStxMaxSpend,
  payerAddress,
  chainId,
  assetDecimals,
}: SchemaCreationParams) {
  const errorMessages = getErrorMessages();

  return z.object({
    amount: z
      .string()
      .superRefine((amount, context) =>
        stxAmountValidator(amount, context, calculateStxMaxSpend, assetDecimals)
      ),
    recipient: z
      .string()
      .refine(isValidStacksAddress, errorMessages.invalidAddress)
      .refine(stxAddressNetworkValidator(chainId), errorMessages.incorrectNetworkAddress)
      .refine(stxNotCurrentAddressValidator(payerAddress), errorMessages.recipientIsPayer)
      .refine(stxComplianceValidator(chainId), errorMessages.nonCompliantAddress),

    memo: z.string().refine(isValidStacksMemo, errorMessages.memoExceedsLimit),
    nonce: z.number(),
    fee: z.number(),
    isSendingMax: z.boolean(),
  });
}

function stxAddressNetworkValidator(chainId: ChainId) {
  return (address: string) => isValidAddressChain(address, chainId);
}

function stxNotCurrentAddressValidator(payerAddress: string) {
  return (address: string) => validatePayerNotRecipient(payerAddress, address);
}

function stxComplianceValidator(chainId: ChainId) {
  return (address: string) =>
    addressComplianceValidator({
      address,
      chain: chainId,
      shouldCheckCompliance: isValidStacksAddress(address),
    });
}

function stxAmountValidator(
  amount: string,
  context: z.RefinementCtx,
  calculateStxMaxSpend: CalculateStxMaxSpend,
  assetDecimals?: number
) {
  const numericAmount = parseFloat(amount);
  const maxSpend = calculateStxMaxSpend();
  const errorMessages = getErrorMessages();
  const decimals = assetDecimals ?? STX_DECIMALS;

  if (isNaN(numericAmount)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: errorMessages.notANumber,
      fatal: true,
    });

    return z.NEVER;
  }

  if (numericAmount === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: errorMessages.notAPositiveNumber,
      fatal: true,
    });

    return z.NEVER;
  }

  if (!isValidPrecision(numericAmount, decimals)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: errorMessages.invalidPrecision(decimals),
    });
  }

  if (stxToMicroStx(numericAmount).isGreaterThan(stxToMicroStx(maxSpend))) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: errorMessages.insufficientFunds,
    });
  }
}

export type StxFormSchema = z.infer<ReturnType<typeof createStxSendFormSchema>>;
