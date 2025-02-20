import { useMemo } from 'react';

import { errorMessages } from '@/features/send/error-messages';
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
}

export function useStxSendFormSchema({
  calculateStxMaxSpend,
  payerAddress,
  chainId,
}: SchemaCreationParams) {
  return useMemo(
    () => createStxSendFormSchema({ calculateStxMaxSpend, payerAddress, chainId }),
    [calculateStxMaxSpend, payerAddress, chainId]
  );
}

function createStxSendFormSchema({
  calculateStxMaxSpend,
  payerAddress,
  chainId,
}: SchemaCreationParams) {
  return z.object({
    amount: z
      .string()
      .superRefine((amount, context) => stxAmountValidator(amount, context, calculateStxMaxSpend)),
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
  calculateStxMaxSpend: CalculateStxMaxSpend
) {
  const numericAmount = parseFloat(amount);
  const maxSpend = calculateStxMaxSpend();

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

  if (!isValidPrecision(numericAmount, STX_DECIMALS)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: errorMessages.invalidPrecision(STX_DECIMALS),
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
