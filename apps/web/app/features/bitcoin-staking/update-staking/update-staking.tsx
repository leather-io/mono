import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import {
  BitcoinStakingPool,
  StakingPoolSlug,
  bitcoinStakingPoolList,
  getStakingPoolFromSlug,
  isPoolAvailableOnNetwork,
  stakingProviderIdToSlug,
} from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { usePox5StackingClientRequired } from '~/features/bitcoin-staking/hooks/use-pox5-clients';
import { useIsHydrated } from '~/hooks/use-is-hydrated';
import {
  POX5_MAX_NUM_CYCLES,
  byosmContractParam,
  byosmPaths,
  stakingPaths,
} from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useLeatherConnect } from '~/store/addresses';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';
import { wallet } from '~/utils/wallet';

import { Button, Input, LoadingSpinner } from '@leather.io/ui';
import { isDefined, stxToMicroStx, truncateMiddle } from '@leather.io/utils';

import { AvailableBalanceRow } from '../components/available-balance-row';
import { Pox5SubmitError } from '../components/pox5-submit-error';
import { PreparePhaseCallout } from '../components/prepare-phase-callout';
import { usePox5CycleClock } from '../hooks/use-pox5-cycle-clock';
import { usePox5Position } from '../hooks/use-pox5-position';
import { usePox5TxTracker } from '../hooks/use-pox5-tx-tracker';
import { Pox5StakerInfo } from '../queries/create-get-pox5-staker-info-query-options';
import {
  usePox5AvailableUnlockedBalance,
  usePox5PoxInfoQuery,
  usePox5SecondsUntilNextCycleQuery,
} from '../queries/pox5-node.query';
import {
  usePox5PayoutPreferenceQuery,
  usePox5PoolFeeQuery,
  usePox5PoolFeesByProvider,
} from '../queries/pox5-stacking.query';
import { ChoosePayoutPreference } from '../start-staking/components/choose-payout-preference';
import { createStakeUpdateMutationOptions } from '../transactions/pox5-mutations';
import { Pox5PayoutPreference } from '../transactions/pox5-signer-calldata';
import { getBroadcastTxId } from '../transactions/pox5-tx-status';
import { ChooseSignerManager } from './components/choose-signer-manager';
import { CustomContractEntry } from './components/custom-contract-entry';
import { SidebarSummaryCard } from './components/sidebar-summary-card';
import { parseSwitchTargetSlug } from './switch-target';
import { createUpdateStakingSchema } from './update-staking-schema';
import {
  SignerManagerFacts,
  buildSignerManagerOptions,
  buildUpdateStakeSummaryRows,
} from './update-staking-summary';
import { useSignerManagerPicker } from './use-signer-manager-picker';

const switchContent = bitcoinStakingContent.switchSignerManager;

function toInputValue(value: unknown): string | number {
  if (typeof value === 'number' || typeof value === 'string') return value;
  return '';
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
  const { isLoading, position } = usePox5Position();
  const { search } = useLocation();

  const activeInfo = position.status === 'active' ? position.info : undefined;
  const activePool =
    position.status === 'active' ? (position.pool ?? getStakingPoolFromSlug('byosm')) : undefined;
  // The form's defaults must include the stored payout preference, so the form
  // only mounts once this query settles (see the wipe note on normalizePayout).
  const payoutQuery = usePox5PayoutPreferenceQuery(
    activePool?.supportsBtcPayout ? activeInfo?.signerManagerContractId : undefined
  );

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  if (position.status !== 'active' || !activePool) {
    return <Navigate to={{ pathname: stakingPaths.pool(poolSlug), search }} replace />;
  }

  const positionSlug = stakingProviderIdToSlug(activePool.providerId);
  if (positionSlug !== poolSlug) {
    const redirectSearch = new URLSearchParams(search);
    if (!position.pool) {
      redirectSearch.set(byosmContractParam, position.info.signerManagerContractId);
    }
    return (
      <Navigate
        to={{ pathname: stakingPaths.update(positionSlug), search: redirectSearch.toString() }}
        replace
      />
    );
  }

  if (activePool.supportsBtcPayout && payoutQuery.isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  if (activePool.supportsBtcPayout && payoutQuery.isError) {
    return (
      <Stack gap="space.04" maxWidth="500px">
        <ErrorLabel>{bitcoinStakingContent.payoutPreference.loadError}</ErrorLabel>
        <Button
          size="md"
          variant="outline"
          alignSelf="flex-start"
          disabled={payoutQuery.isRefetching}
          onClick={() => void payoutQuery.refetch()}
        >
          Try again
        </Button>
      </Stack>
    );
  }

  return (
    <UpdateStakingForm
      poolSlug={poolSlug}
      pool={activePool}
      address={address}
      info={position.info}
      currentPayout={payoutQuery.data ?? null}
      initialTargetSlug={parseSwitchTargetSlug({
        search,
        currentProviderId: activePool.providerId,
        networkMode: pox5NetworkConfig.contractNetworkMode,
      })}
    />
  );
}

interface UpdateStakingFormProps {
  poolSlug: StakingPoolSlug;
  pool: BitcoinStakingPool;
  address: string;
  info: Pox5StakerInfo;
  currentPayout: Pox5PayoutPreference | null;
  initialTargetSlug: StakingPoolSlug | null;
}

function UpdateStakingForm({
  poolSlug,
  pool,
  address,
  info,
  currentPayout,
  initialTargetSlug,
}: UpdateStakingFormProps) {
  const navigate = useNavigate();
  const { track } = usePox5TxTracker();
  const client = usePox5StackingClientRequired();
  const { btcAddressP2wpkh } = useLeatherConnect();

  const { cycleClock } = usePox5CycleClock();
  const { isLoading: availableBalanceIsLoading, availableBalance } =
    usePox5AvailableUnlockedBalance(address);
  const poxInfoQuery = usePox5PoxInfoQuery();
  const secondsUntilNextCycleQuery = usePox5SecondsUntilNextCycleQuery();

  const currentIsCustom = poolSlug === 'byosm';
  const picker = useSignerManagerPicker({
    currentContractId: info.signerManagerContractId,
    currentPool: currentIsCustom ? null : pool,
    initialTargetSlug,
  });
  const { target, isSwitching, isCustomSelected, customState } = picker;

  const availablePools = bitcoinStakingPoolList.filter(availablePool =>
    isPoolAvailableOnNetwork(availablePool, pox5NetworkConfig.contractNetworkMode)
  );
  const feeBipsByProvider = usePox5PoolFeesByProvider(availablePools);
  const currentFeeQuery = usePox5PoolFeeQuery(
    typeof pool.fixedFeeBips === 'number' ? undefined : info.signerManagerContractId
  );
  const customTargetFeeQuery = usePox5PoolFeeQuery(
    target && !target.pool ? target.contractId : undefined
  );

  const currentFacts: SignerManagerFacts = {
    name: currentIsCustom ? truncateMiddle(info.signerManagerContractId) : pool.name,
    isCustom: currentIsCustom,
    supportsBtcPayout: pool.supportsBtcPayout,
    feeBips: pool.fixedFeeBips ?? currentFeeQuery.data ?? null,
  };

  const targetFacts = ((): SignerManagerFacts | null => {
    if (!target) return null;
    if (target.pool) {
      return {
        name: target.pool.name,
        isCustom: false,
        supportsBtcPayout: target.pool.supportsBtcPayout,
        feeBips: feeBipsByProvider[target.pool.providerId] ?? null,
      };
    }
    return {
      name: truncateMiddle(target.contractId),
      isCustom: true,
      supportsBtcPayout: true,
      feeBips: customTargetFeeQuery.data ?? null,
    };
  })();

  const effectiveSupportsBtcPayout = targetFacts
    ? targetFacts.supportsBtcPayout
    : pool.supportsBtcPayout;

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
        supportsBtcPayout: effectiveSupportsBtcPayout,
        networkMode: pox5NetworkConfig.bitcoinNetworkMode,
        currentPayout,
        isSwitching,
      })
    ),
  });

  const {
    mutate: submitStakeUpdate,
    isPending,
    error: stakeUpdateError,
  } = useMutation(createStakeUpdateMutationOptions({ wallet, client }));

  const isInPreparePhase = cycleClock?.clock.isInPreparePhase ?? false;

  const handleUpdate = formMethods.handleSubmit(values => {
    const increaseMicroStx = values.amountIncrease
      ? BigInt(stxToMicroStx(Number(values.amountIncrease)).toString())
      : 0n;

    // The submitted value is always the full intended end state: the (kept or
    // edited) preference when the toggle is on, or an explicit clear back to
    // sBTC when it is off (absent calldata deletes the stored preference).
    const payoutPreference: Pox5PayoutPreference | undefined =
      effectiveSupportsBtcPayout &&
      values.payoutEnabled &&
      values.rewardAddress &&
      values.maxFeeSats
        ? {
            btcRewardAddress: values.rewardAddress,
            maxFeeSats: BigInt(values.maxFeeSats),
          }
        : undefined;

    const targetProviderId = (() => {
      if (!target) return pool.providerId;
      return target.pool ? target.pool.providerId : 'byosm';
    })();

    submitStakeUpdate(
      {
        providerId: pool.providerId,
        targetProviderId,
        newSignerManagerContractId: target?.contractId ?? info.signerManagerContractId,
        currentSignerManagerContractId: info.signerManagerContractId,
        cyclesToExtend: values.cyclesToExtend,
        amountIncreaseMicroStx: increaseMicroStx,
        currentAmountMicroStx: info.amountMicroStx,
        payoutPreference,
      },
      {
        onSuccess(result) {
          const txId = getBroadcastTxId(result);
          const destination = (() => {
            if (target) {
              return target.pool
                ? stakingPaths.active(stakingProviderIdToSlug(target.pool.providerId))
                : byosmPaths.active(target.contractId);
            }
            return currentIsCustom
              ? byosmPaths.active(info.signerManagerContractId)
              : stakingPaths.active(poolSlug);
          })();
          if (!txId) {
            void navigate(destination);
            return;
          }
          track({ kind: 'stake-update', txId, destination, startedAt: Date.now() });
        },
      }
    );
  });

  const watchedCyclesToExtend = Number(formMethods.watch('cyclesToExtend'));
  const cyclesToExtendForSummary =
    Number.isInteger(watchedCyclesToExtend) && watchedCyclesToExtend > 0
      ? Math.min(watchedCyclesToExtend, maxCyclesToExtend)
      : 0;

  const watchedAmountIncrease = formMethods.watch('amountIncrease');
  const amountIncreaseForSummary = (() => {
    if (typeof watchedAmountIncrease !== 'string') return 0n;
    if (!/^\d+(\.\d+)?$/.test(watchedAmountIncrease)) return 0n;
    const micro = stxToMicroStx(Number(watchedAmountIncrease));
    if (!micro.isInteger()) return 0n;
    return BigInt(micro.toString());
  })();

  const summaryRows = buildUpdateStakeSummaryRows({
    current: currentFacts,
    target: targetFacts,
    customPendingValidation: isCustomSelected && customState.status !== 'valid',
    amountMicroStx: info.amountMicroStx,
    amountIncreaseMicroStx: amountIncreaseForSummary,
    firstRewardCycle: info.firstRewardCycle,
    numCycles: info.numCycles,
    cyclesToExtend: cyclesToExtendForSummary,
    nextCycleId: poxInfoQuery.data?.next_cycle.id ?? null,
    daysUntilNextCycle:
      secondsUntilNextCycleQuery.data !== undefined
        ? Math.round(secondsUntilNextCycleQuery.data / (60 * 60 * 24))
        : null,
  });

  const signerManagerOptions = buildSignerManagerOptions({
    availablePools,
    feeBipsByProvider,
    currentPool: currentIsCustom ? null : pool,
    currentContractId: info.signerManagerContractId,
  });

  const terms = target
    ? {
        label: target.pool
          ? switchContent.poolTerms(target.pool.name)
          : switchContent.customAcknowledgment,
        accepted: picker.termsAccepted,
        onToggleAccepted: picker.toggleTermsAccepted,
      }
    : undefined;

  const confirmLabel = (() => {
    if (isCustomSelected && customState.status !== 'valid') return switchContent.validateFirst;
    if (isSwitching) return switchContent.confirmSwitch;
    return switchContent.confirmUpdate;
  })();

  const confirmDisabled =
    isInPreparePhase ||
    (isSwitching && !picker.termsAccepted) ||
    (isCustomSelected && customState.status !== 'valid');

  return (
    <FormProvider {...formMethods}>
      <Flex gap="space.07" alignItems="flex-start" flexWrap="wrap" mb="space.07">
        <Stack gap="space.05" flex={1} minWidth="360px" maxWidth="500px">
          <styled.h1 textStyle="heading.04">Update stake</styled.h1>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            You currently have{' '}
            {toHumanReadableMicroStx(new BigNumber(info.amountMicroStx.toString()))} locked with{' '}
            {currentFacts.name}. Extend the lock, add more STX, or switch pools — changes take
            effect from the next cycle.
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
                      Locked for {remainingCycles} more {remainingCycles === 1 ? 'cycle' : 'cycles'}{' '}
                      — extendable by up to {maxCyclesToExtend}.
                    </styled.p>
                  )}
                </>
              )}
            />
          </Box>

          <Stack>
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

            <AvailableBalanceRow
              isLoading={availableBalanceIsLoading}
              availableAmount={availableBalance.amount}
              onSelectMax={amount => formMethods.setValue('amountIncrease', String(amount))}
            />
          </Stack>

          <Stack gap="space.02">
            <styled.p textStyle="label.02">{switchContent.sectionLabel}</styled.p>
            <ChooseSignerManager
              options={signerManagerOptions}
              selectedProviderId={picker.selectedRowId}
              onSelect={picker.selectRow}
              customEntry={
                <CustomContractEntry
                  value={picker.customInput}
                  state={customState}
                  onChange={picker.onCustomInputChange}
                  onValidate={picker.validateCustom}
                />
              }
            />
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              {switchContent.helper}
            </styled.p>
          </Stack>

          <Stack gap="space.02">
            <styled.p textStyle="label.02">Rewards payout</styled.p>
            <ChoosePayoutPreference supportsBtcPayout={effectiveSupportsBtcPayout} />
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              {bitcoinStakingContent.payoutPreference.updateHelper}
            </styled.p>
          </Stack>
        </Stack>

        <Box width="320px" flexShrink={0}>
          <Stack gap="space.03">
            <SidebarSummaryCard
              rows={summaryRows}
              terms={terms}
              confirmLabel={confirmLabel}
              confirmDisabled={confirmDisabled}
              confirmTestId="confirm-update-stake-button"
              isBusy={isPending}
              onConfirm={handleUpdate}
            />
            <Pox5SubmitError error={stakeUpdateError} />
          </Stack>
        </Box>
      </Flex>
    </FormProvider>
  );
}
