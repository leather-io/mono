import BigNumber from 'bignumber.js';
import { z } from 'zod';
import { StackingProviderId } from '~/data/data';
import { toHumanReadableStx } from '~/utils/unit-convert';
import {
  stxAmountSchema,
  validateMaxStackingAmount,
  validateMinStackingAmount,
} from '~/utils/validators/stx-amount-validator';

import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import { BitcoinNetworkModes, Money } from '@leather.io/models';

import { getStackingPoolById } from './stacking-pool-types';

function btcAddressNetworkValidator(networkMode: BitcoinNetworkModes) {
  return (address: string) => isValidBitcoinNetworkAddress(address, networkMode);
}

interface SchemaCreationParams {
  networkMode: BitcoinNetworkModes;
  providerId: StackingProviderId;
  availableBalance: Money;
  stackedAmount?: BigNumber;
}

export function createValidationSchema({
  providerId,
  networkMode,
  stackedAmount,
}: SchemaCreationParams) {
  return z
    .object({
      amount: stxAmountSchema()
        .refine(value => validateMaxStackingAmount(value))
        .refine(
          value => {
            if (stackedAmount?.isGreaterThan(0)) {
              return validateMinStackingAmount(value, stackedAmount.toNumber());
            }
            return true;
          },
          {
            message: `You must delegate more than you've already stacked (${toHumanReadableStx(stackedAmount ?? 0)})`,
          }
        ),
      rewardAddress: z
        .string()
        .refine(isValidBitcoinAddress, 'Address is not valid') // TODO: invalidAddress
        .refine(btcAddressNetworkValidator(networkMode), 'Address is for incorrect network'), // incorrectNetworkAddress
    })
    .superRefine((data, ctx) => {
      const amount = data.amount;
      const minDelegatedStackingAmount =
        getStackingPoolById(providerId).minimumDelegationAmount || 0;
      if (!validateMinStackingAmount(amount, minDelegatedStackingAmount)) {
        ctx.addIssue({
          code: 'custom',
          message: `You must delegate at least ${toHumanReadableStx(minDelegatedStackingAmount)}`,
          path: ['amount'],
        });
      }
    });
}

export type StackingPoolFormSchema = z.infer<ReturnType<typeof createValidationSchema>>;
