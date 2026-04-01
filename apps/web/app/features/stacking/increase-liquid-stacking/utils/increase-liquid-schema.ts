import { StacksNetworkName } from '@stacks/network';
import { StackerInfo } from '@stacks/stacking';
import BigNumber from 'bignumber.js';
import { z } from 'zod';
import { validationMessages } from '~/content/messages';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';
import {
  stxAmountSchema,
  validateAvailableBalance,
  validateMaxStackingAmount,
} from '~/utils/validators/stx-amount-validator';

interface CreateValidationSchemaArgs {
  availableBalanceUStx?: BigNumber;
  transactionFeeUStx?: bigint;
  stackerInfo?: StackerInfo;
  network: StacksNetworkName;
  rewardCycleId?: number;
}
export function createIncreaseLiquidValidationSchema({
  availableBalanceUStx,
}: CreateValidationSchemaArgs) {
  return z.object({
    increaseBy: stxAmountSchema()
      .refine(value => validateMaxStackingAmount(value))
      .refine(value => validateAvailableBalance(value, availableBalanceUStx), {
        message: `${validationMessages.availableBalance} ${toHumanReadableMicroStx(availableBalanceUStx ?? 0)}`,
      }),
  });
}
