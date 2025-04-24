import BigNumber from 'bignumber.js';
import { z } from 'zod';
import { pools } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import { PoolName } from '~/features/stacking/start-pooled-stacking/utils/types-preset-pools';
import { toHumanReadableStx } from '~/utils/unit-convert';
import {
  stxAmountSchema,
  validateAvailableBalance,
  validateMaxStackingAmount,
  validateMinStackingAmount,
} from '~/utils/validators/stx-amount-validator';

import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import { BitcoinNetworkModes, Money } from '@leather.io/models';

function btcAddressNetworkValidator(networkMode: BitcoinNetworkModes) {
  return (address: string) => isValidBitcoinNetworkAddress(address, networkMode);
}

interface SchemaCreationParams {
  networkMode: BitcoinNetworkModes;
  poolName: PoolName;
  availableBalance: Money;
  stackedAmount?: BigNumber;
}

export function createValidationSchema({
  poolName,
  networkMode,
  availableBalance,
  stackedAmount,
}: SchemaCreationParams) {
  const availableBalanceAmount = availableBalance.amount;
  return z
    .object({
      amount: stxAmountSchema()
        .refine(value => validateMaxStackingAmount(value))
        .refine(value => validateAvailableBalance(value, availableBalanceAmount), {
          message: `Available balance is ${toHumanReadableStx(availableBalanceAmount ?? 0)}`,
        })
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
      const minDelegatedStackingAmount = pools[poolName].minimumDelegationAmount || 0;
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
