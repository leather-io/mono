import { StacksNetworkName } from '@stacks/network';
import { StackerInfo } from '@stacks/stacking';
import BigNumber from 'bignumber.js';
import { z } from 'zod';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';
import {
  stxAmountSchema,
  validateAvailableBalance,
  validateMaxStackingAmount,
} from '~/utils/validators/stx-amount-validator';
import { content } from '~/data/content';

interface CreateValidationSchemaArgs {
  availableBalanceUStx?: BigNumber;
  transactionFeeUStx?: bigint;
  stackerInfo?: StackerInfo;
  network: StacksNetworkName;
  rewardCycleId?: number;
}

export function createValidationSchema({ availableBalanceUStx }: CreateValidationSchemaArgs) {
  return z.object({
    increaseBy: stxAmountSchema()
      .refine(value => validateMaxStackingAmount(value))
      .refine(value => validateAvailableBalance(value, availableBalanceUStx), {
        message: `${content.validationMessages.availableBalance} ${toHumanReadableMicroStx(availableBalanceUStx ?? 0)}`,
      }),
  });
}

export type IncreaseLiquidFormSchema = z.infer<ReturnType<typeof createValidationSchema>>; // TODO: Use as main type for form
