import { z } from 'zod';
import { validationMessages } from '~/content/messages';
import { POX5_MAX_NUM_CYCLES } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';
import {
  stxAmountSchema,
  validateAvailableBalance,
  validateMaxStackingAmount,
  validateMinStackingAmount,
} from '~/utils/validators/stx-amount-validator';

import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import { BitcoinNetworkModes, Money } from '@leather.io/models';

interface CreateStakingFormSchemaArgs {
  networkMode: BitcoinNetworkModes;
  availableBalance: Money;
  minimumStakeAmount: number;
  supportsBtcPayout: boolean;
}

// Unlike pox-4 delegation, a pox-5 stake locks exactly the entered amount, so
// the amount is capped by the available unlocked balance instead of allowing
// over-delegation. The payout-preference fields are validated only when the
// pool supports L1 BTC payout and the user opted in; maxFeeSats stays a string
// so an untouched empty input is not coerced to an invalid 0.
export function createStakingFormSchema({
  networkMode,
  availableBalance,
  minimumStakeAmount,
  supportsBtcPayout,
}: CreateStakingFormSchemaArgs) {
  return z
    .object({
      amount: stxAmountSchema()
        .refine(value => validateMaxStackingAmount(value))
        .refine(value => validateMinStackingAmount(value, minimumStakeAmount), {
          message: `${validationMessages.mustStackAtLeast} ${toHumanReadableMicroStx(minimumStakeAmount)}`,
        })
        .refine(value => validateAvailableBalance(value, availableBalance.amount), {
          message: validationMessages.cannotStackMoreThanBalance,
        }),
      cycles: z.coerce
        .number({ error: () => validationMessages.chooseStakingCycles })
        .int(validationMessages.chooseStakingCycles)
        .min(1, validationMessages.chooseStakingCycles)
        .max(POX5_MAX_NUM_CYCLES, validationMessages.chooseStakingCycles),
      payoutEnabled: z.boolean(),
      rewardAddress: z.string().optional(),
      maxFeeSats: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!supportsBtcPayout || !data.payoutEnabled) return;

      if (!data.rewardAddress || !isValidBitcoinAddress(data.rewardAddress)) {
        ctx.addIssue({
          code: 'custom',
          message: validationMessages.addressNotValid,
          path: ['rewardAddress'],
        });
      } else if (!isValidBitcoinNetworkAddress(data.rewardAddress, networkMode)) {
        ctx.addIssue({
          code: 'custom',
          message: validationMessages.addressIncorrectNetwork,
          path: ['rewardAddress'],
        });
      }

      if (!data.maxFeeSats || !/^\d+$/.test(data.maxFeeSats) || BigInt(data.maxFeeSats) <= 0n) {
        ctx.addIssue({
          code: 'custom',
          message: validationMessages.enterMaxWithdrawalFee,
          path: ['maxFeeSats'],
        });
      }
    });
}

export type StakingFormSchema = z.infer<ReturnType<typeof createStakingFormSchema>>;
