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
import { microStxToStx, stxToMicroStx } from '@leather.io/utils';

import { Pox5PayoutPreference } from '../../transactions/pox5-signer-calldata';
import { PoolPayoutMode, canPayoutInBtc, isBtcPayoutRequired } from '../../utils/pool-payout';

export interface PoolMinStake {
  poolName: string;
  minStakeMicroStx: bigint;
}

interface CreateStakingFormSchemaArgs {
  networkMode: BitcoinNetworkModes;
  availableBalance?: Money;
  payoutMode: PoolPayoutMode;
  supportsMinClaim: boolean;
  minStake?: PoolMinStake;
}

function isNumericInput(value: string | undefined): value is string {
  return !!value && /^\d+(\.\d+)?$/.test(value);
}

export function meetsPoolMinStake(amountMicroStx: bigint, minStake: PoolMinStake | undefined) {
  return minStake === undefined || amountMicroStx >= minStake.minStakeMicroStx;
}

export function formatMinStakeStx(minStake: PoolMinStake): string {
  return microStxToStx(minStake.minStakeMicroStx.toString()).toFormat();
}

export function stxInputToMicroStx(value: string): bigint {
  const micro = stxToMicroStx(Number(value));
  return micro.isInteger() ? BigInt(micro.toString()) : 0n;
}

interface PayoutFormValues {
  payoutEnabled: boolean;
  rewardAddress?: string;
  maxFeeSats?: string;
  minClaimSats?: string;
}

export function wantsBtcPayout(
  values: Pick<PayoutFormValues, 'payoutEnabled'>,
  mode: PoolPayoutMode
) {
  return isBtcPayoutRequired(mode) || (canPayoutInBtc(mode) && values.payoutEnabled);
}

export function buildPayoutPreference(
  values: PayoutFormValues,
  payoutMode: PoolPayoutMode,
  supportsMinClaim: boolean
): Pox5PayoutPreference | undefined {
  if (!wantsBtcPayout(values, payoutMode) || !values.rewardAddress) return undefined;
  if (isBtcPayoutRequired(payoutMode)) return { btcRewardAddress: values.rewardAddress };
  if (!values.maxFeeSats) return undefined;
  return {
    btcRewardAddress: values.rewardAddress,
    maxFeeSats: BigInt(values.maxFeeSats),
    ...(supportsMinClaim && values.minClaimSats
      ? { minClaimSats: BigInt(values.minClaimSats) }
      : {}),
  };
}

export function validateRewardAddress(
  rewardAddress: string | undefined,
  networkMode: BitcoinNetworkModes,
  addIssue: (message: string) => void
) {
  if (!rewardAddress || !isValidBitcoinAddress(rewardAddress)) {
    addIssue(validationMessages.addressNotValid);
  } else if (!isValidBitcoinNetworkAddress(rewardAddress, networkMode)) {
    addIssue(validationMessages.addressIncorrectNetwork);
  }
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
  payoutMode,
  supportsMinClaim,
  minStake,
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
            !availableBalance ||
            !isNumericInput(value) ||
            validateAvailableBalance(Number(value), availableBalance.amount),
          validationMessages.cannotStackMoreThanBalance
        )
        .refine(
          value => !isNumericInput(value) || meetsPoolMinStake(stxInputToMicroStx(value), minStake),
          minStake
            ? validationMessages.stakeBelowPoolMinimum(
                minStake.poolName,
                formatMinStakeStx(minStake)
              )
            : undefined
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
      if (!wantsBtcPayout(data, payoutMode)) return;

      validateRewardAddress(data.rewardAddress, networkMode, message =>
        ctx.addIssue({ code: 'custom', message, path: ['rewardAddress'] })
      );

      if (isBtcPayoutRequired(payoutMode)) return;

      validatePayoutSatsFields(data, supportsMinClaim, (message, path) =>
        ctx.addIssue({ code: 'custom', message, path: [path] })
      );
    });
}

export type StakingFormSchema = z.infer<ReturnType<typeof createStakingFormSchema>>;
