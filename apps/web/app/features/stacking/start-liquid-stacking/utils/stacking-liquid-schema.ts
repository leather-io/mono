import { z } from 'zod';
import { content } from '~/data/content';
import { protocols } from '~/features/stacking/start-liquid-stacking/utils/preset-protocols';
import { ProtocolName } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';
import {
  stxAmountSchema,
  validateAvailableBalance,
  validateMaxStackingAmount,
  validateMinStackingAmount,
} from '~/utils/validators/stx-amount-validator';

import { Money } from '@leather.io/models';

interface SchemaCreationParams {
  protocolName: ProtocolName;
  availableBalance: Money | undefined;
}

export function createValidationSchema({ protocolName, availableBalance }: SchemaCreationParams) {
  const availableBalanceAmount = availableBalance?.amount;
  return z
    .object({
      amount: stxAmountSchema()
        .refine(value => validateMaxStackingAmount(value))
        .refine(value => validateAvailableBalance(value, availableBalanceAmount), {
          message: `${content.validationMessages.availableBalance} ${toHumanReadableMicroStx(availableBalanceAmount ?? 0)}`,
        }),
    })
    .superRefine((data, ctx) => {
      const amount = data.amount;
      const minDelegatedStackingAmount = protocols[protocolName].minimumDelegationAmount || 0;
      if (!validateMinStackingAmount(amount, minDelegatedStackingAmount)) {
        ctx.addIssue({
          code: 'custom',
          message: `${content.validationMessages.mustStackAtLeast} ${toHumanReadableMicroStx(minDelegatedStackingAmount)}`,
          path: ['amount'],
        });
      }
    });
}

export type StackingLiquidFormSchema = z.infer<ReturnType<typeof createValidationSchema>>;
