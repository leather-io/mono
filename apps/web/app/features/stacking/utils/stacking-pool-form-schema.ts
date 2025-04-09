import { z } from 'zod';
import { UI_IMPOSED_MAX_STACKING_AMOUNT_USTX } from '~/constants/constants';
import { pools } from '~/features/stacking/components/preset-pools';
import { PoolName } from '~/features/stacking/utils/types-preset-pools';
import { toHumanReadableStx } from '~/utils/unit-convert';
import { stxAmountSchema } from '~/utils/validators/stx-amount-validator';

import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import { BitcoinNetworkModes } from '@leather.io/models';
import { stxToMicroStx } from '@leather.io/utils';

function btcAddressNetworkValidator(networkMode: BitcoinNetworkModes) {
  return (address: string) => isValidBitcoinNetworkAddress(address, networkMode);
}

interface SchemaCreationParams {
  networkMode: BitcoinNetworkModes;
  poolName: PoolName;
}

export function createValidationSchema({ poolName, networkMode }: SchemaCreationParams) {
  return z
    .object({
      amount: stxAmountSchema().refine(value => {
        if (value === undefined) return false;
        const enteredAmount = stxToMicroStx(value);
        return enteredAmount.isLessThanOrEqualTo(UI_IMPOSED_MAX_STACKING_AMOUNT_USTX);
      }),

      rewardAddress: z
        .string()
        .refine(isValidBitcoinAddress, 'Address is not valid') // TODO: invalidAddress
        .refine(btcAddressNetworkValidator(networkMode), 'Address is for incorrect network'), // incorrectNetworkAddress
    })
    .superRefine((data, ctx) => {
      const amount = data.amount;
      const minDelegatedStackingAmount = pools[poolName].minimumDelegationAmount || 0;
      const enteredAmount = stxToMicroStx(amount || 0);
      if (enteredAmount.isLessThan(minDelegatedStackingAmount)) {
        ctx.addIssue({
          code: 'custom',
          message: `You must delegate at least ${toHumanReadableStx(minDelegatedStackingAmount)}`,
          path: ['amount'],
        });
      }
    });
}

export type StackingPoolFormSchema = z.infer<ReturnType<typeof createValidationSchema>>;
