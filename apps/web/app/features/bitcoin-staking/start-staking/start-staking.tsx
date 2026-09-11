import { useEffect, useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Flex, Stack, styled } from 'leather-styles/jsx';
import { FormPageLayout } from '~/components/forms/form-page.layout';
import { learnArticles } from '~/content/learn-content';
import {
  StakingPoolSlug,
  getPrimarySignerManagerContract,
  getSignerManagerContracts,
  getStakingPoolFromSlug,
} from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { StackingContractDetails } from '~/features/stacking/components/stacking-contract-details';
import { StackingFormItemTitle } from '~/features/stacking/components/stacking-form-item-title';
import { StackingFormStepsPanel } from '~/features/stacking/components/stacking-form-steps-panel';
import { StartStackingDrawer } from '~/features/stacking/components/start-stacking-drawer';
import {
  DEFAULT_MIN_CLAIM_SATS,
  DEFAULT_STAKING_CYCLES,
  MIN_MAX_WITHDRAWAL_FEE_SATS,
  byosmPaths,
  stakingPaths,
} from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useLeatherConnect } from '~/store/addresses';
import { wallet } from '~/utils/wallet';

import { Button, Hr, LoadingSpinner } from '@leather.io/ui';
import { stxToMicroStx } from '@leather.io/utils';

import { PendingStakePanel } from '../components/pending-stake-panel';
import { PoolHealthWarning } from '../components/pool-health-warning';
import { Pox5SubmitError } from '../components/pox5-submit-error';
import { PreparePhaseCallout } from '../components/prepare-phase-callout';
import { StakingPoolOverview, cycleStatusFromClock } from '../components/staking-pool-overview';
import { usePox5ChainStackingClient } from '../hooks/use-pox5-clients';
import { usePox5CycleClock } from '../hooks/use-pox5-cycle-clock';
import { usePox5Position } from '../hooks/use-pox5-position';
import { usePox5TxTracker } from '../hooks/use-pox5-tx-tracker';
import { useStakingConnectAction } from '../hooks/use-staking-connect-action';
import {
  usePox5AvailableUnlockedBalance,
  usePox5PoxInfoQuery,
  usePox5SecondsUntilNextCycleQuery,
} from '../queries/pox5-node.query';
import {
  usePox5ContractId,
  usePox5PayoutPreferenceQuery,
  usePox5PoolTotalStaked,
} from '../queries/pox5-stacking.query';
import { createStakeMutationOptions } from '../transactions/pox5-mutations';
import { getBroadcastTxId } from '../transactions/pox5-tx-status';
import { canPayoutInBtc, getPoolPayoutMode, isBtcPayoutRequired } from '../utils/pool-payout';
import { ChoosePayoutPreference } from './components/choose-payout-preference';
import { ChooseStakingAmount } from './components/choose-staking-amount';
import { ChooseStakingConditions } from './components/choose-staking-conditions';
import { ChooseStakingDuration } from './components/choose-staking-duration';
import {
  StakingConfirmationSteps,
  StartStakingStepId,
} from './components/staking-confirmation-steps';
import {
  PoolMinStake,
  StakingFormSchema,
  buildPayoutPreference,
  createStakingFormSchema,
} from './utils/staking-form-schema';

interface StartStakingProps {
  poolSlug: StakingPoolSlug;
  signerManagerContractId?: string;
}

export function StartStaking({
  poolSlug,
  signerManagerContractId: signerManagerContractIdOverride,
}: StartStakingProps) {
  const client = usePox5ChainStackingClient();
  const { stacksAccount, btcPaymentAddress } = useLeatherConnect();
  const connectAction = useStakingConnectAction();

  const navigate = useNavigate();
  const { track } = usePox5TxTracker();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const pool = getStakingPoolFromSlug(poolSlug);
  const signerManagerContractId =
    signerManagerContractIdOverride ??
    getPrimarySignerManagerContract(pool.providerId, pox5NetworkConfig.contractNetworkMode);
  const signerManagerContractIds = signerManagerContractIdOverride
    ? [signerManagerContractIdOverride]
    : getSignerManagerContracts(pool.providerId, pox5NetworkConfig.contractNetworkMode);
  const pox5ContractId = usePox5ContractId();

  const { totalStakedMicroStx } = usePox5PoolTotalStaked(signerManagerContractIds);

  const activeDestination =
    poolSlug === 'byosm' && signerManagerContractId
      ? byosmPaths.active(signerManagerContractId)
      : stakingPaths.active(poolSlug);

  const { isLoading: positionIsLoading, position } = usePox5Position();
  const { cycleClock } = usePox5CycleClock();

  const poxInfoQuery = usePox5PoxInfoQuery();
  const getSecondsUntilNextCycleQuery = usePox5SecondsUntilNextCycleQuery();

  const { isLoading: totalAvailableBalanceIsLoading, availableBalance: totalAvailableBalance } =
    usePox5AvailableUnlockedBalance(stacksAccount?.address);

  const payoutMode = getPoolPayoutMode(pool);
  const payoutPreferenceQuery = usePox5PayoutPreferenceQuery(
    canPayoutInBtc(payoutMode) ? signerManagerContractId : undefined
  );
  const supportsMinClaim = payoutPreferenceQuery.data?.supportsMinClaim ?? false;
  const minStake = useMemo<PoolMinStake | undefined>(
    () =>
      pool.minStakeMicroStx !== undefined
        ? { poolName: pool.name, minStakeMicroStx: pool.minStakeMicroStx }
        : undefined,
    [pool.name, pool.minStakeMicroStx]
  );

  const schema = useMemo(
    () =>
      createStakingFormSchema({
        networkMode: pox5NetworkConfig.bitcoinNetworkMode,
        availableBalance: stacksAccount ? totalAvailableBalance : undefined,
        payoutMode,
        supportsMinClaim,
        minStake,
      }),
    [stacksAccount, totalAvailableBalance, payoutMode, supportsMinClaim, minStake]
  );

  const formMethods = useForm({
    mode: 'onTouched',
    defaultValues: {
      cycles: DEFAULT_STAKING_CYCLES,
      payoutEnabled: isBtcPayoutRequired(payoutMode),
      rewardAddress: btcPaymentAddress?.address,
      maxFeeSats: String(MIN_MAX_WITHDRAWAL_FEE_SATS),
      minClaimSats: String(DEFAULT_MIN_CLAIM_SATS),
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!btcPaymentAddress || formMethods.getValues('rewardAddress')) return;
    formMethods.setValue('rewardAddress', btcPaymentAddress.address);
  }, [btcPaymentAddress, formMethods]);

  useEffect(() => {
    if (!formMethods.getValues('amount')) return;
    void formMethods.trigger('amount');
  }, [schema, formMethods]);

  const stakeAmount = Number(formMethods.watch('amount') ?? NaN);
  const watchedCycles = Number(formMethods.watch('cycles') ?? NaN);

  const {
    data: stakeResult,
    mutate: submitStake,
    isPending: handleStakePending,
    error: stakeError,
  } = useMutation(createStakeMutationOptions({ wallet, client }));

  const handleStake = formMethods.handleSubmit(values => {
    if (!signerManagerContractId || !stacksAccount) return;
    const formValues: StakingFormSchema = values;
    const payoutPreference = buildPayoutPreference(formValues, payoutMode, supportsMinClaim);

    submitStake(
      {
        providerId: pool.providerId,
        signerManagerContractId,
        amountMicroStx: BigInt(stxToMicroStx(Number(formValues.amount)).toString()),
        numCycles: formValues.cycles,
        payoutPreference,
      },
      {
        onSuccess(result) {
          const txId = getBroadcastTxId(result);
          if (!txId) {
            void navigate(activeDestination);
            return;
          }
          track({ kind: 'stake', txId, destination: activeDestination, startedAt: Date.now() });
        },
      }
    );
  });

  const isInPreparePhase = cycleClock?.clock.isInPreparePhase ?? false;

  const estimatedUnlockDate =
    cycleClock && Number.isInteger(watchedCycles) && watchedCycles > 0
      ? cycleClock.estimatedUnlockDateForCycles(watchedCycles, new Date())
      : null;

  const nextCycleNumber = poxInfoQuery.data?.next_cycle.id ?? null;
  const daysUntilNextCycle =
    getSecondsUntilNextCycleQuery.data !== undefined
      ? Math.round(getSecondsUntilNextCycleQuery.data / (60 * 60 * 24))
      : null;

  const cycleStatus = cycleClock ? cycleStatusFromClock(cycleClock.clock) : null;

  if (positionIsLoading) {
    return (
      <Flex height="100vh" width="100%">
        <LoadingSpinner />
      </Flex>
    );
  }

  if (position.status === 'active') {
    return <Navigate to={activeDestination} replace />;
  }

  if (position.status === 'pending-stake') {
    return (
      <Stack gap="space.06" mb="space.07">
        <PendingStakePanel />
      </Stack>
    );
  }

  if (!signerManagerContractId) {
    return (
      <Stack gap="space.06" mb="space.07">
        <styled.p textStyle="label.02">{pool.name} is not available on this network yet.</styled.p>
      </Stack>
    );
  }

  function onSubmit(confirmation: StartStakingStepId) {
    if (confirmation === 'connect') {
      if ('run' in connectAction) void connectAction.run();
      return;
    }
    if (confirmation === 'terms') {
      setTermsConfirmed(v => !v);
      return;
    }
    if (confirmation === 'stake') {
      if (isInPreparePhase) return;
      return handleStake();
    }

    throw new Error(`Unknown confirmation type: ${confirmation}`);
  }

  const isConnected = connectAction.status === 'connected';

  const confirmationState = {
    connect: {
      accepted: isConnected,
      loading: connectAction.status === 'pending',
      visible: !isConnected,
    },
    terms: {
      accepted: termsConfirmed,
      loading: false,
      visible: true,
    },
    stake: {
      accepted: Boolean(stakeResult),
      loading:
        !isConnected || handleStakePending || isInPreparePhase || totalAvailableBalanceIsLoading,
      visible: true,
    },
  };

  const confirmationSteps = (
    <>
      {isInPreparePhase && cycleClock && (
        <PreparePhaseCallout
          secondsUntilStakingReopens={cycleClock.clock.secondsUntilStakingReopens}
        />
      )}
      <StakingConfirmationSteps
        onSubmit={onSubmit}
        connectAction={connectAction}
        confirmationState={confirmationState}
        stakeAmount={stakeAmount}
        cycles={watchedCycles}
        estimatedUnlockDate={estimatedUnlockDate}
      />
      <Pox5SubmitError error={stakeError} mt="space.03" px="space.05" />
    </>
  );

  return (
    <Stack gap={['space.06', 'space.06', 'space.06', 'space.09']} mb="space.07">
      <StakingPoolOverview
        pool={pool}
        signerManagerContractId={signerManagerContractId}
        totalStakedMicroStx={totalStakedMicroStx}
        nextCycleNumber={nextCycleNumber}
        daysUntilNextCycle={daysUntilNextCycle}
        cycleStatus={cycleStatus}
      />

      <PoolHealthWarning totalStakedMicroStx={totalStakedMicroStx} />

      <FormProvider {...formMethods}>
        <FormPageLayout
          form={
            <Form>
              <Stack gap={['space.05', 'space.05', 'space.05', 'space.07']}>
                <Stack gap="space.02">
                  <StackingFormItemTitle title="Amount" article={learnArticles.stackingAmount} />
                  <ChooseStakingAmount
                    availableAmount={totalAvailableBalance.amount}
                    isLoading={totalAvailableBalanceIsLoading}
                    minStake={minStake}
                    connectAction={connectAction}
                  />
                </Stack>

                <Hr />

                <Stack gap="space.02">
                  <StackingFormItemTitle
                    title="Duration"
                    article={learnArticles.stackingDuration}
                  />
                  <ChooseStakingDuration estimatedUnlockDate={estimatedUnlockDate} />
                </Stack>

                <Hr />
                <Stack gap="space.02">
                  <StackingFormItemTitle
                    title="Rewards payout"
                    article={learnArticles.stackingRewardsAddress}
                  />
                  <ChoosePayoutPreference
                    payoutMode={payoutMode}
                    supportsMinClaim={supportsMinClaim}
                    operatorPayout={
                      pool.operatorBtcPayout
                        ? { poolName: pool.name, cadence: pool.operatorBtcPayout.cadence }
                        : undefined
                    }
                  />
                </Stack>

                <Hr />

                <Stack gap="space.02">
                  <StackingFormItemTitle
                    title="Details"
                    article={learnArticles.stackingContractDetails}
                  />
                  <StackingContractDetails
                    addressTitle="Signer manager"
                    address={signerManagerContractId}
                    contractAddress={pox5ContractId}
                  />
                </Stack>

                <Hr />

                <Stack gap="space.04">
                  <StackingFormItemTitle
                    title="Staking conditions"
                    article={learnArticles.pooledStackingConditions}
                  />
                  <ChooseStakingConditions />
                </Stack>

                <Button
                  px="space.06"
                  size="md"
                  width="100%"
                  display={['block', null, null, 'none']}
                  onClick={() => setDrawerOpen(true)}
                >
                  Review
                </Button>
              </Stack>
            </Form>
          }
          preview={
            <StackingFormStepsPanel display={['none', null, null, 'flex']}>
              {confirmationSteps}
            </StackingFormStepsPanel>
          }
        />
      </FormProvider>

      <StartStackingDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
        {confirmationSteps}
      </StartStackingDrawer>
    </Stack>
  );
}
