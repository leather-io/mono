import { useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { StackingClient } from '@stacks/stacking';
import { useMutation } from '@tanstack/react-query';
import { Flex, Stack, styled } from 'leather-styles/jsx';
import { FormPageLayout } from '~/components/forms/form-page.layout';
import { learnArticles } from '~/content/learn-content';
import {
  StakingPoolSlug,
  getSignerManagerContract,
  getStakingPoolFromSlug,
} from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { StackingContractDetails } from '~/features/stacking/components/stacking-contract-details';
import { StackingFormItemTitle } from '~/features/stacking/components/stacking-form-item-title';
import { StackingFormStepsPanel } from '~/features/stacking/components/stacking-form-steps-panel';
import { StartStackingDrawer } from '~/features/stacking/components/start-stacking-drawer';
import {
  DEFAULT_STAKING_CYCLES,
  stakingPaths,
} from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useLeatherConnect } from '~/store/addresses';
import { leather } from '~/utils/leather-sdk';

import { Button, Hr, LoadingSpinner } from '@leather.io/ui';
import { stxToMicroStx } from '@leather.io/utils';

import { PendingStakePanel } from '../components/pending-stake-panel';
import { PoolHealthWarning } from '../components/pool-health-warning';
import { Pox5SubmitError } from '../components/pox5-submit-error';
import { PreparePhaseCallout } from '../components/prepare-phase-callout';
import { StakingPoolOverview, cycleStatusFromClock } from '../components/staking-pool-overview';
import { usePox5StackingClient } from '../hooks/use-pox5-clients';
import { usePox5CycleClock } from '../hooks/use-pox5-cycle-clock';
import { usePox5Position } from '../hooks/use-pox5-position';
import { usePox5TxTracker } from '../hooks/use-pox5-tx-tracker';
import {
  usePox5AvailableUnlockedBalance,
  usePox5PoxInfoQuery,
  usePox5SecondsUntilNextCycleQuery,
} from '../queries/pox5-node.query';
import { usePox5ContractId } from '../queries/pox5-stacking.query';
import { Pox5PayoutPreference } from '../transactions/pox5-signer-calldata';
import { createStakeMutationOptions } from '../transactions/pox5-stake';
import { getBroadcastTxId } from '../transactions/pox5-tx-status';
import { ChoosePayoutPreference } from './components/choose-payout-preference';
import { ChooseStakingAmount } from './components/choose-staking-amount';
import { ChooseStakingConditions } from './components/choose-staking-conditions';
import { ChooseStakingDuration } from './components/choose-staking-duration';
import {
  StakingConfirmationSteps,
  StartStakingStepId,
} from './components/staking-confirmation-steps';
import { StakingFormSchema, createStakingFormSchema } from './utils/staking-form-schema';

interface StartStakingProps {
  poolSlug: StakingPoolSlug;
}

export function StartStaking({ poolSlug }: StartStakingProps) {
  const client = usePox5StackingClient();
  const { stacksAccount } = useLeatherConnect();

  if (!stacksAccount || !client) return 'You need to connect Leather';

  return <StartStakingLayout client={client} poolSlug={poolSlug} />;
}

interface StartStakingLayoutProps {
  poolSlug: StakingPoolSlug;
  client: StackingClient;
}

function StartStakingLayout({ poolSlug, client }: StartStakingLayoutProps) {
  const { stacksAccount, btcAddressP2wpkh } = useLeatherConnect();
  if (!stacksAccount) throw new Error('No STX address available');

  const navigate = useNavigate();
  const { track } = usePox5TxTracker();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const pool = getStakingPoolFromSlug(poolSlug);
  const signerManagerContractId = getSignerManagerContract(
    pool.providerId,
    pox5NetworkConfig.contractNetworkMode
  );
  const pox5ContractId = usePox5ContractId();

  const { isLoading: positionIsLoading, position } = usePox5Position();
  const { cycleClock } = usePox5CycleClock();

  const poxInfoQuery = usePox5PoxInfoQuery();
  const getSecondsUntilNextCycleQuery = usePox5SecondsUntilNextCycleQuery();

  const { isLoading: totalAvailableBalanceIsLoading, availableBalance: totalAvailableBalance } =
    usePox5AvailableUnlockedBalance(stacksAccount.address);

  const schema = useMemo(
    () =>
      createStakingFormSchema({
        networkMode: pox5NetworkConfig.bitcoinNetworkMode,
        availableBalance: totalAvailableBalance,
        minimumStakeAmount: pool.minimumStakeAmount,
        supportsBtcPayout: pool.supportsBtcPayout,
      }),
    [totalAvailableBalance, pool.minimumStakeAmount, pool.supportsBtcPayout]
  );

  const formMethods = useForm({
    mode: 'onTouched',
    defaultValues: {
      cycles: DEFAULT_STAKING_CYCLES,
      payoutEnabled: false,
      rewardAddress: btcAddressP2wpkh?.address,
      maxFeeSats: '',
    },
    resolver: zodResolver(schema),
  });

  const stakeAmount = Number(formMethods.watch('amount') ?? NaN);
  const watchedCycles = Number(formMethods.watch('cycles') ?? NaN);

  const {
    data: stakeResult,
    mutate: submitStake,
    isPending: handleStakePending,
    error: stakeError,
  } = useMutation(createStakeMutationOptions({ leather, client }));

  const handleStake = formMethods.handleSubmit(values => {
    if (!signerManagerContractId) return;
    const formValues: StakingFormSchema = values;

    const payoutPreference: Pox5PayoutPreference | undefined =
      pool.supportsBtcPayout &&
      formValues.payoutEnabled &&
      formValues.rewardAddress &&
      formValues.maxFeeSats
        ? {
            btcRewardAddress: formValues.rewardAddress,
            maxFeeSats: BigInt(formValues.maxFeeSats),
          }
        : undefined;

    submitStake(
      {
        providerId: pool.providerId,
        signerManagerContractId,
        amountMicroStx: BigInt(stxToMicroStx(formValues.amount).toString()),
        numCycles: formValues.cycles,
        payoutPreference,
      },
      {
        onSuccess(result) {
          const txId = getBroadcastTxId(result);
          const destination = stakingPaths.active(poolSlug);
          if (!txId) {
            void navigate(destination);
            return;
          }
          track({ kind: 'stake', txId, destination, startedAt: Date.now() });
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
    return <Navigate to={stakingPaths.active(poolSlug)} replace />;
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

  const confirmationState = {
    terms: {
      accepted: termsConfirmed,
      loading: false,
      visible: true,
    },
    stake: {
      accepted: Boolean(stakeResult),
      loading: handleStakePending || isInPreparePhase,
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
        nextCycleNumber={nextCycleNumber}
        daysUntilNextCycle={daysUntilNextCycle}
        cycleStatus={cycleStatus}
      />

      <PoolHealthWarning totalStakedMicroStx={null} />

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

                {pool.supportsBtcPayout && (
                  <>
                    <Hr />
                    <Stack gap="space.02">
                      <StackingFormItemTitle
                        title="Rewards payout"
                        article={learnArticles.stackingRewardsAddress}
                      />
                      <ChoosePayoutPreference />
                    </Stack>
                  </>
                )}

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
                  display={['block', null, 'none']}
                  onClick={() => setDrawerOpen(true)}
                >
                  Review
                </Button>
              </Stack>
            </Form>
          }
          preview={<StackingFormStepsPanel>{confirmationSteps}</StackingFormStepsPanel>}
        />
      </FormProvider>

      <StartStackingDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
        {confirmationSteps}
      </StartStackingDrawer>
    </Stack>
  );
}
