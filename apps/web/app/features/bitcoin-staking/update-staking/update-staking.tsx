import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { z } from 'zod';
import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { validationMessages } from '~/content/messages';
import {
  BitcoinStakingPool,
  StakingPoolSlug,
  getStakingPoolFromSlug,
} from '~/data/bitcoin-staking-data';
import { usePox5StackingClientRequired } from '~/features/bitcoin-staking/hooks/use-pox5-clients';
import { useIsHydrated } from '~/hooks/use-is-hydrated';
import {
  POX5_BITCOIN_NETWORK_MODE,
  POX5_MAX_NUM_CYCLES,
  stakingPaths,
} from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useLeatherConnect } from '~/store/addresses';
import { leather } from '~/utils/leather-sdk';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';
import { validateAvailableBalance } from '~/utils/validators/stx-amount-validator';

import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import { BitcoinNetworkModes } from '@leather.io/models';
import { Button, Input, LoadingSpinner } from '@leather.io/ui';
import { isDefined, stxToMicroStx } from '@leather.io/utils';

import { PreparePhaseCallout } from '../components/prepare-phase-callout';
import { usePox5CycleClock } from '../hooks/use-pox5-cycle-clock';
import { usePox5Position } from '../hooks/use-pox5-position';
import { Pox5StakerInfo } from '../queries/create-get-pox5-staker-info-query-options';
import { usePox5AvailableUnlockedBalance } from '../queries/pox5-node.query';
import { usePox5PayoutPreferenceQuery } from '../queries/pox5-stacking.query';
import { ChoosePayoutPreference } from '../start-staking/components/choose-payout-preference';
import { Pox5PayoutPreference } from '../transactions/pox5-signer-calldata';
import { createStakeUpdateMutationOptions } from '../transactions/pox5-stake-update';

const updateStakingMessages = {
  nothingToUpdate: 'Extend your lock, increase your amount, or change your payout preference',
};

function toInputValue(value: unknown): string | number {
  if (typeof value === 'number' || typeof value === 'string') return value;
  return '';
}

// The payout preference lives in the signer-manager and is RESTATED by every
// stake-update: present calldata stores it, absent calldata deletes it. The
// form therefore always resolves to an explicit payout end state (defaulting
// to the on-chain one) so an unrelated extend/top-up can never silently wipe
// an existing BTC payout setting.
function normalizePayout(payout: Pox5PayoutPreference | null | undefined): string | null {
  if (!payout) return null;
  return `${payout.btcRewardAddress}:${payout.maxFeeSats}`;
}

interface CreateUpdateStakingSchemaArgs {
  availableBalance: ReturnType<typeof stxToMicroStx>;
  maxCyclesToExtend: number;
  supportsBtcPayout: boolean;
  networkMode: BitcoinNetworkModes;
  currentPayout: Pox5PayoutPreference | null;
}

function createUpdateStakingSchema({
  availableBalance,
  maxCyclesToExtend,
  supportsBtcPayout,
  networkMode,
  currentPayout,
}: CreateUpdateStakingSchemaArgs) {
  const chooseExtendCycles =
    maxCyclesToExtend === 0
      ? `Your lock already spans the maximum ${POX5_MAX_NUM_CYCLES} cycles — only an amount increase is possible`
      : `Choose between 0 and ${maxCyclesToExtend} cycles`;
  return z
    .object({
      cyclesToExtend: z.coerce
        .number({ error: () => chooseExtendCycles })
        .int(chooseExtendCycles)
        .min(0, chooseExtendCycles)
        .max(maxCyclesToExtend, chooseExtendCycles),
      amountIncrease: z
        .string()
        .optional()
        .refine(value => !value || /^\d+(\.\d+)?$/.test(value), validationMessages.invalidAmount)
        .refine(
          value => !value || validateAvailableBalance(Number(value), availableBalance),
          validationMessages.cannotStackMoreThanBalance
        ),
      payoutEnabled: z.boolean(),
      rewardAddress: z.string().optional(),
      maxFeeSats: z.string().optional(),
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
        if (!data.maxFeeSats || !/^\d+$/.test(data.maxFeeSats) || BigInt(data.maxFeeSats) <= 0n) {
          ctx.addIssue({
            code: 'custom',
            message: validationMessages.enterMaxWithdrawalFee,
            path: ['maxFeeSats'],
          });
        }
      }

      const increase = data.amountIncrease ? Number(data.amountIncrease) : 0;
      const formPayout =
        supportsBtcPayout && data.payoutEnabled && data.rewardAddress && data.maxFeeSats
          ? `${data.rewardAddress}:${data.maxFeeSats}`
          : null;
      const payoutChanged = formPayout !== normalizePayout(currentPayout);
      if (data.cyclesToExtend === 0 && increase === 0 && !payoutChanged) {
        ctx.addIssue({
          code: 'custom',
          message: updateStakingMessages.nothingToUpdate,
          path: ['cyclesToExtend'],
        });
      }
    });
}

interface UpdateStakingProps {
  poolSlug: StakingPoolSlug;
}

export function UpdateStaking({ poolSlug }: UpdateStakingProps) {
  const isHydrated = useIsHydrated();
  const { stacksAccount } = useLeatherConnect();

  if (!isHydrated) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  if (!stacksAccount) return 'You need to connect Leather';

  return <UpdateStakingLayout poolSlug={poolSlug} address={stacksAccount.address} />;
}

interface UpdateStakingLayoutProps {
  poolSlug: StakingPoolSlug;
  address: string;
}

function UpdateStakingLayout({ poolSlug, address }: UpdateStakingLayoutProps) {
  const pool = getStakingPoolFromSlug(poolSlug);
  const { isLoading, position } = usePox5Position();

  const activeInfo = position?.status === 'active' ? position.info : undefined;
  // The form's defaults must include the stored payout preference, so the form
  // only mounts once this query settles (see the wipe note on normalizePayout).
  const payoutQuery = usePox5PayoutPreferenceQuery(
    pool.supportsBtcPayout ? activeInfo?.signerManagerContractId : undefined
  );

  if (isLoading || (pool.supportsBtcPayout && activeInfo && payoutQuery.isLoading)) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  if (position.status !== 'active') {
    return <Navigate to={stakingPaths.pool(poolSlug)} replace />;
  }

  return (
    <UpdateStakingForm
      poolSlug={poolSlug}
      pool={pool}
      address={address}
      info={position.info}
      currentPayout={payoutQuery.data ?? null}
    />
  );
}

interface UpdateStakingFormProps {
  poolSlug: StakingPoolSlug;
  pool: BitcoinStakingPool;
  address: string;
  info: Pox5StakerInfo;
  currentPayout: Pox5PayoutPreference | null;
}

function UpdateStakingForm({
  poolSlug,
  pool,
  address,
  info,
  currentPayout,
}: UpdateStakingFormProps) {
  const navigate = useNavigate();
  const client = usePox5StackingClientRequired();
  const { btcAddressP2wpkh } = useLeatherConnect();

  const { cycleClock } = usePox5CycleClock();
  const { availableBalance } = usePox5AvailableUnlockedBalance(address);

  // pox-5 stake-update recomputes the TOTAL remaining lock — (unlock-cycle −
  // current-cycle − 1) + cycles-to-extend — and aborts with
  // ERR_INVALID_NUM_CYCLES beyond MAX_NUM_CYCLES, so the real extend limit is
  // the maximum minus the cycles still remaining on the position.
  const currentCycleId = cycleClock?.clock.currentCycleId;
  const remainingCycles =
    currentCycleId !== undefined
      ? Math.max(0, info.firstRewardCycle + info.numCycles - currentCycleId - 1)
      : undefined;
  const maxCyclesToExtend =
    remainingCycles === undefined
      ? POX5_MAX_NUM_CYCLES
      : Math.max(0, POX5_MAX_NUM_CYCLES - remainingCycles);

  const formMethods = useForm({
    mode: 'onTouched',
    defaultValues: {
      cyclesToExtend: 0,
      amountIncrease: '',
      payoutEnabled: currentPayout !== null,
      rewardAddress: currentPayout?.btcRewardAddress ?? btcAddressP2wpkh?.address,
      maxFeeSats: currentPayout ? String(currentPayout.maxFeeSats) : '',
    },
    resolver: zodResolver(
      createUpdateStakingSchema({
        availableBalance: availableBalance.amount,
        maxCyclesToExtend,
        supportsBtcPayout: pool.supportsBtcPayout,
        networkMode: POX5_BITCOIN_NETWORK_MODE,
        currentPayout,
      })
    ),
  });

  const { mutateAsync: handleStakeUpdateSubmit, isPending } = useMutation(
    createStakeUpdateMutationOptions({ leather, client })
  );

  const isInPreparePhase = cycleClock?.clock.isInPreparePhase ?? false;

  const handleUpdate = formMethods.handleSubmit(values => {
    const increaseMicroStx = values.amountIncrease
      ? BigInt(stxToMicroStx(Number(values.amountIncrease)).toString())
      : 0n;

    // The submitted value is always the full intended end state: the (kept or
    // edited) preference when the toggle is on, or an explicit clear back to
    // sBTC when it is off (absent calldata deletes the stored preference).
    const payoutPreference: Pox5PayoutPreference | undefined =
      pool.supportsBtcPayout && values.payoutEnabled && values.rewardAddress && values.maxFeeSats
        ? {
            btcRewardAddress: values.rewardAddress,
            maxFeeSats: BigInt(values.maxFeeSats),
          }
        : undefined;

    return handleStakeUpdateSubmit({
      providerId: pool.providerId,
      newSignerManagerContractId: info.signerManagerContractId,
      currentSignerManagerContractId: info.signerManagerContractId,
      cyclesToExtend: values.cyclesToExtend,
      amountIncreaseMicroStx: increaseMicroStx,
      currentAmountMicroStx: info.amountMicroStx,
      payoutPreference,
    }).then(() => navigate(stakingPaths.active(poolSlug)));
  });

  return (
    <FormProvider {...formMethods}>
      <Stack gap="space.05" mb="space.07" maxWidth="500px">
        <styled.h1 textStyle="heading.04">Update stake</styled.h1>
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          You currently have{' '}
          {toHumanReadableMicroStx(new BigNumber(info.amountMicroStx.toString()))} locked with{' '}
          {pool.name}. Extend the lock, add more STX, or both — changes take effect from the next
          cycle.
        </styled.p>

        {isInPreparePhase && cycleClock && (
          <PreparePhaseCallout
            secondsUntilStakingReopens={cycleClock.clock.secondsUntilStakingReopens}
          />
        )}

        <Box>
          <Controller
            control={formMethods.control}
            name="cyclesToExtend"
            render={({
              field: { onChange, onBlur, value, ref },
              fieldState: { invalid, error },
            }) => (
              <>
                <Input.Root data-shrink={isDefined(value)}>
                  <Input.Label>Cycles to extend</Input.Label>
                  <Input.Field
                    id="cyclesToExtend"
                    inputMode="numeric"
                    value={toInputValue(value)}
                    onChange={input => onChange(input.target.value)}
                    onBlur={onBlur}
                    ref={ref}
                  />
                </Input.Root>
                {invalid && error && <ErrorLabel mt="space.02">{error.message}</ErrorLabel>}
                {remainingCycles !== undefined && (
                  <styled.p textStyle="caption.02" color="ink.text-subdued" mt="space.02">
                    Locked for {remainingCycles} more {remainingCycles === 1 ? 'cycle' : 'cycles'} —
                    extendable by up to {maxCyclesToExtend}.
                  </styled.p>
                )}
              </>
            )}
          />
        </Box>

        <Box>
          <Controller
            control={formMethods.control}
            name="amountIncrease"
            render={({
              field: { onChange, onBlur, value, ref },
              fieldState: { invalid, error },
            }) => (
              <>
                <Input.Root data-shrink={isDefined(value)}>
                  <Input.Label>Additional STX to lock (optional)</Input.Label>
                  <Input.Field
                    id="amountIncrease"
                    value={toInputValue(value)}
                    onChange={input => onChange(input.target.value)}
                    onBlur={onBlur}
                    ref={ref}
                  />
                </Input.Root>
                {invalid && error && <ErrorLabel mt="space.02">{error.message}</ErrorLabel>}
              </>
            )}
          />
        </Box>

        {pool.supportsBtcPayout && (
          <Stack gap="space.02">
            <styled.p textStyle="label.02">Rewards payout</styled.p>
            <ChoosePayoutPreference />
            <styled.p textStyle="caption.02" color="ink.text-subdued">
              {bitcoinStakingContent.payoutPreference.updateHelper}
            </styled.p>
          </Stack>
        )}

        <Button
          size="md"
          onClick={handleUpdate}
          disabled={isPending || isInPreparePhase}
          data-testid="confirm-update-stake-button"
        >
          Confirm update
        </Button>
      </Stack>
    </FormProvider>
  );
}
