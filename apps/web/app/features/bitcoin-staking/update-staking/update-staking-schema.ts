import { z } from 'zod';
import { validationMessages } from '~/content/messages';
import { POX5_MAX_NUM_CYCLES } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import {
  validateAvailableBalance,
  validateStxAmountPrecision,
} from '~/utils/validators/stx-amount-validator';

import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import { BitcoinNetworkModes } from '@leather.io/models';
import { stxToMicroStx } from '@leather.io/utils';

import { validatePayoutSatsFields } from '../start-staking/utils/staking-form-schema';
import { Pox5PayoutPreference } from '../transactions/pox5-signer-calldata';

export const updateStakingMessages = {
  nothingToUpdate:
    'Extend your lock, increase your amount, change your payout preference, or switch pools',
};

// The payout preference lives in the signer-manager and is RESTATED by every
// stake-update: present calldata stores it, absent calldata deletes it. The
// form therefore always resolves to an explicit payout end state (defaulting
// to the on-chain one) so an unrelated extend/top-up can never silently wipe
// an existing BTC payout setting.
function normalizePayout(payout: Pox5PayoutPreference | null | undefined): string | null {
  if (!payout) return null;
  return `${payout.btcRewardAddress}:${payout.maxFeeSats}:${payout.minClaimSats ?? ''}`;
}

interface CreateUpdateStakingSchemaArgs {
  availableBalance: ReturnType<typeof stxToMicroStx>;
  maxCyclesToExtend: number;
  supportsBtcPayout: boolean;
  supportsMinClaim: boolean;
  networkMode: BitcoinNetworkModes;
  currentPayout: Pox5PayoutPreference | null;
  isSwitching: boolean;
}

export function createUpdateStakingSchema({
  availableBalance,
  maxCyclesToExtend,
  supportsBtcPayout,
  supportsMinClaim,
  networkMode,
  currentPayout,
  isSwitching,
}: CreateUpdateStakingSchemaArgs) {
  const chooseExtendCycles =
    maxCyclesToExtend === 0
      ? `Your lock already spans the maximum ${POX5_MAX_NUM_CYCLES} cycles — only an amount increase or a pool switch is possible`
      : `Choose between 0 and ${maxCyclesToExtend} cycles`;
  return z
    .object({
      cyclesToExtend: z.coerce
        .number()
        .catch(Number.NaN)
        .refine(value => Number.isInteger(value), chooseExtendCycles)
        .refine(value => value >= 0 && value <= maxCyclesToExtend, chooseExtendCycles),
      amountIncrease: z
        .string()
        .optional()
        .refine(value => !value || /^\d+(\.\d+)?$/.test(value), validationMessages.invalidAmount)
        .refine(
          value => !value || validateStxAmountPrecision(Number(value)),
          validationMessages.amountTooPrecise
        )
        .refine(
          value => !value || validateAvailableBalance(Number(value), availableBalance),
          validationMessages.cannotStackMoreThanBalance
        ),
      payoutEnabled: z.boolean(),
      rewardAddress: z.string().optional(),
      maxFeeSats: z.string().optional(),
      minClaimSats: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (supportsBtcPayout && data.payoutEnabled) {
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
        validatePayoutSatsFields(data, supportsMinClaim, (message, path) =>
          ctx.addIssue({ code: 'custom', message, path: [path] })
        );
      }

      const increase = data.amountIncrease ? Number(data.amountIncrease) : 0;
      const formPayout =
        supportsBtcPayout && data.payoutEnabled && data.rewardAddress && data.maxFeeSats
          ? `${data.rewardAddress}:${data.maxFeeSats}:${(supportsMinClaim && data.minClaimSats) || ''}`
          : null;
      const payoutChanged = formPayout !== normalizePayout(currentPayout);
      if (!isSwitching && data.cyclesToExtend === 0 && increase === 0 && !payoutChanged) {
        ctx.addIssue({
          code: 'custom',
          message: updateStakingMessages.nothingToUpdate,
          path: ['cyclesToExtend'],
        });
      }
    });
}
