import BigNumber from 'bignumber.js';
import { z } from 'zod';
import { validationMessages } from '~/content/messages';
import { PoxContractName, StackingProviderId } from '~/data/data';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';
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

const poxContractsRequiringRewardAddress: PoxContractName[] = [
  'WrapperOneCycle',
  'WrapperStackingDao',
];

export function poxContractRequiresRewardAddress(poxContract: PoxContractName): boolean {
  return poxContractsRequiringRewardAddress.includes(poxContract);
}

interface SchemaCreationParams {
  networkMode: BitcoinNetworkModes;
  providerId: StackingProviderId;
  availableBalance: Money;
  stackedAmount?: BigNumber;
  poxContract: PoxContractName;
}

export function createStackingPoolFormValidationSchema({
  providerId,
  networkMode,
  stackedAmount,
  poxContract,
}: SchemaCreationParams) {
  const rewardAddress = poxContractRequiresRewardAddress(poxContract)
    ? z
        .string()
        .refine(isValidBitcoinAddress, validationMessages.addressNotValid) // TODO: invalidAddress
        .refine(btcAddressNetworkValidator(networkMode), validationMessages.addressIncorrectNetwork) // incorrectNetworkAddress
    : z.string().optional();

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
            message: `${validationMessages.mustDelegateMore} (${toHumanReadableMicroStx(stackedAmount ?? 0)})`,
          }
        ),
      rewardAddress,
    })
    .superRefine((data, ctx) => {
      const amount = data.amount;
      const minDelegatedStackingAmount =
        getStackingPoolById(providerId).minimumDelegationAmount || 0;
      if (!validateMinStackingAmount(amount, minDelegatedStackingAmount)) {
        ctx.addIssue({
          code: 'custom',
          message: `${validationMessages.mustDelegateAtLeast} ${toHumanReadableMicroStx(minDelegatedStackingAmount)}`,
          path: ['amount'],
        });
      }
    });
}

export type StackingPoolFormSchema = z.infer<
  ReturnType<typeof createStackingPoolFormValidationSchema>
>;
