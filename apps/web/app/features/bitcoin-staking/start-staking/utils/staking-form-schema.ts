import { z } from 'zod';
import { validationMessages } from '~/content/messages';
import {
  MIN_MAX_WITHDRAWAL_FEE_SATS,
  POX5_MAX_NUM_CYCLES,
  SBTC_WITHDRAWAL_DUST_LIMIT_SATS,
} from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import {
  validateAvailableBalance,
  validateMaxStackingAmount,
  validateStxAmountPrecision,
} from '~/utils/validators/stx-amount-validator';

import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import { BitcoinNetworkModes, Money } from '@leather.io/models';

interface CreateStakingFormSchemaArgs {
  networkMode: BitcoinNetworkModes;
  availableBalance: Money;
  supportsBtcPayout: boolean;
  supportsMinClaim: boolean;
}

function isNumericInput(value: string | undefined): value is string {
  return !!value && /^\d+(\.\d+)?$/.test(value);
}

export function getSmallestValidMinClaimSats(maxFeeSats: string | undefined): bigint | null {
  if (!maxFeeSats || !/^\d+$/.test(maxFeeSats)) return null;
  return BigInt(maxFeeSats) + BigInt(SBTC_WITHDRAWAL_DUST_LIMIT_SATS) + 1n;
}

export function validatePayoutSatsFields(
  data: { maxFeeSats?: string; minClaimSats?: string },
  supportsMinClaim: boolean,
  addIssue: (message: string, path: 'maxFeeSats' | 'minClaimSats') => void
) {
  const hasValidMaxFee = !!data.maxFeeSats && /^\d+$/.test(data.maxFeeSats);
  if (!hasValidMaxFee) {
    addIssue(validationMessages.enterMaxWithdrawalFee, 'maxFeeSats');
  } else if (BigInt(data.maxFeeSats) < BigInt(MIN_MAX_WITHDRAWAL_FEE_SATS)) {
    addIssue(validationMessages.maxWithdrawalFeeTooLow, 'maxFeeSats');
  }

  if (!supportsMinClaim || !data.minClaimSats) return;
  const smallestValidMinClaimSats = getSmallestValidMinClaimSats(data.maxFeeSats);
  if (!/^\d+$/.test(data.minClaimSats)) {
    addIssue(validationMessages.minClaimNotNumeric, 'minClaimSats');
  } else if (
    smallestValidMinClaimSats !== null &&
    BigInt(data.minClaimSats) < smallestValidMinClaimSats
  ) {
    addIssue(
      validationMessages.minClaimTooLow(smallestValidMinClaimSats.toLocaleString('en-US')),
      'minClaimSats'
    );
  }
}

// Unlike pox-4 delegation, a pox-5 stake locks exactly the entered amount, so
// the amount is capped by the available unlocked balance instead of allowing
// over-delegation. The payout-preference fields are validated only when the
// pool supports L1 BTC payout and the user opted in; maxFeeSats stays a string
// so an untouched empty input is not coerced to an invalid 0.
export function createStakingFormSchema({
  networkMode,
  availableBalance,
  supportsBtcPayout,
  supportsMinClaim,
}: CreateStakingFormSchemaArgs) {
  return z
    .object({
      amount: z
        .string()
        .optional()
        .refine(value => value !== undefined && value !== '', validationMessages.enterAmount)
        .refine(value => !value || /^\d+(\.\d+)?$/.test(value), validationMessages.invalidAmount)
        .refine(
          value => !isNumericInput(value) || Number(value) > 0,
          validationMessages.mustStackAmount
        )
        .refine(
          value => !isNumericInput(value) || validateStxAmountPrecision(Number(value)),
          validationMessages.amountTooPrecise
        )
        .refine(value => !isNumericInput(value) || validateMaxStackingAmount(Number(value)))
        .refine(
          value =>
            !isNumericInput(value) ||
            validateAvailableBalance(Number(value), availableBalance.amount),
          validationMessages.cannotStackMoreThanBalance
        ),
      cycles: z.coerce
        .number()
        .catch(Number.NaN)
        .refine(value => Number.isInteger(value), validationMessages.chooseStakingCycles)
        .refine(
          value => value >= 1 && value <= POX5_MAX_NUM_CYCLES,
          validationMessages.chooseStakingCycles
        ),
      payoutEnabled: z.boolean(),
      rewardAddress: z.string().optional(),
      maxFeeSats: z.string().optional(),
      minClaimSats: z.string().optional(),
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

      validatePayoutSatsFields(data, supportsMinClaim, (message, path) =>
        ctx.addIssue({ code: 'custom', message, path: [path] })
      );
    });
}

export type StakingFormSchema = z.infer<ReturnType<typeof createStakingFormSchema>>;
