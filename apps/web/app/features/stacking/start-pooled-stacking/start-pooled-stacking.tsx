import { useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { StackingClient } from '@stacks/stacking';
import { ClarityType } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { Flex, Stack, styled } from 'leather-styles/jsx';
import { PooledStackingConfirmationStepId } from '~/components/confirmations/confirmation-steps';
import { PoolOverview } from '~/components/pool-overview';
import { Page } from '~/features/page/page';
import { StackingFormStepsPanel } from '~/features/stacking/components/stacking-form-steps-panel';
import { StartStackingLayout } from '~/features/stacking/components/stacking-layout';
import { StartStackingDrawer } from '~/features/stacking/components/start-stacking-drawer';
import { usePoolInfo } from '~/features/stacking/hooks/use-pool-info';
import { useDelegationStatusQuery } from '~/features/stacking/pooled-stacking-info/use-delegation-status-query';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import { ChoosePoolingAmount } from '~/features/stacking/start-pooled-stacking/components/choose-pooling-amount';
import { PooledStackingConfirmationSteps } from '~/features/stacking/start-pooled-stacking/components/pooled-stacking-confirmation-steps';
import {
  createAllowContractCallerSubmitMutationOptions,
  isAllowContractCallerConfirmed,
} from '~/features/stacking/start-pooled-stacking/utils/utils-allow-contract-caller';
import { createDelegateStxMutationOptions } from '~/features/stacking/start-pooled-stacking/utils/utils-delegate-stx';
import {
  getPoxContractsByNetwork,
  getPoxWrapperContract2,
  requiresAllowContractCaller,
} from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { leather } from '~/helpers/leather-sdk';
import {
  useStxAvailableUnlockedBalance,
  useStxBalance,
} from '~/queries/balance/account-balance.hooks';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';
import { getPosts } from '~/utils/post-utils';

import { Button, Hr, LoadingSpinner } from '@leather.io/ui';

import { StackingContractDetails } from '../components/stacking-contract-details';
import { StackingFormItemTitle } from '../components/stacking-form-item-title';
import {
  useGetAllowanceContractCallersQuery,
  useGetPoxInfoQuery,
  useGetSecondsUntilNextCycleQuery,
} from '../hooks/stacking.query';
import { ChoosePoolingConditions } from './components/choose-pooling-conditions';
import { ChoosePoolingDuration } from './components/choose-pooling-duration';
import { ChooseRewardsAddress } from './components/choose-rewards-address';
import { StackingPoolFormSchema, createValidationSchema } from './utils/stacking-pool-form-schema';
import { PoolSlug, getPoolFromSlug } from './utils/stacking-pool-types';
import { PoolWrapperAllowanceState } from './utils/types';

interface StartPooledStackingProps {
  poolSlug: PoolSlug;
}

export function StartPooledStacking({ poolSlug }: StartPooledStackingProps) {
  const { client } = useStackingClient();
  const { stacksAccount } = useLeatherConnect();

  if (!stacksAccount || !client) return 'You need to connect Leather';

  return <StartPooledStackingLayout client={client} poolSlug={poolSlug} />;
}

const initialStackingFormValues: Partial<StackingPoolFormSchema> = {};

interface StartPooledStackingLayoutProps {
  poolSlug: PoolSlug;
  client: StackingClient;
}

// This is not a layout component
function StartPooledStackingLayout({ poolSlug, client }: StartPooledStackingLayoutProps) {
  const { stacksAccount, btcAddressP2wpkh } = useLeatherConnect();
  if (!stacksAccount) throw new Error('No STX address available');

  const stacksClient = useStacksClient();
  const poolInfo = usePoolInfo(poolSlug);

  const { network, networkInstance, networkPreference } = useStacksNetwork();
  const poxContracts = useMemo(() => getPoxContractsByNetwork(network), [network]);
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const getSecondsUntilNextCycleQuery = useGetSecondsUntilNextCycleQuery();

  const [contractAddress, contractName] = getPoxContractsByNetwork(network).Pox4.split('.');

  const getAllowanceContractCallersFastPoolQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperFastPool'],
    senderAddress: stacksAccount.address,
    client: stacksClient,
  });

  const getAllowanceContractCallersRestakeQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperRestake'],
    senderAddress: stacksAccount.address,
    client: stacksClient,
  });

  const getAllowanceContractCallersOneCycleQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperOneCycle'],
    senderAddress: stacksAccount.address,
    client: stacksClient,
  });

  const {
    filteredBalanceQuery: { isLoading: totalAvailableBalanceIsLoading },
  } = useStxBalance(stacksAccount.address);
  const totalAvailableBalance = useStxAvailableUnlockedBalance(stacksAccount.address);

  const poxInfoQuery = useGetPoxInfoQuery();

  const delegationStatusQuery = useDelegationStatusQuery();
  const stackedAmount = useMemo(() => {
    if (delegationStatusQuery.data?.delegated) {
      return new BigNumber(delegationStatusQuery.data.details.amount_micro_stx.toString());
    }
    return undefined;
  }, [delegationStatusQuery.data]);

  const pool = getPoolFromSlug(poolSlug);
  const poolStxAddress = pool.poolAddress?.[networkInstance];
  const poxWrapperContract =
    (pool?.poxContract ? getPoxWrapperContract2(networkInstance, pool.poxContract) : undefined) ||
    poxInfoQuery.data?.contract_id;

  const schema = useMemo(
    () =>
      createValidationSchema({
        networkMode: networkPreference.chain.bitcoin.mode,
        providerId: pool.providerId,
        availableBalance: totalAvailableBalance,
        stackedAmount,
      }),
    [networkPreference.chain.bitcoin.mode, pool.providerId, totalAvailableBalance, stackedAmount]
  );

  if (!poxWrapperContract) throw new Error('No POX wrapper contract available');

  const {
    data: allowContractCallerResult,
    mutateAsync: handleAllowContractCallerSubmit,
    isPending: handleAllowContractCallerSubmitPending,
  } = useMutation(
    createAllowContractCallerSubmitMutationOptions({
      leather,
      client,
      network: networkInstance,
      poxWrapperContract,
    })
  );

  const {
    data: delegateStxResult,
    mutateAsync: handleDelegateStxSubmit,
    isPending: handleDelegateStxPending,
  } = useMutation(
    createDelegateStxMutationOptions({
      leather,
      client,
      network: networkInstance,
    })
  );

  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const hasUserConfirmedPoolWrapperContract = useMemo<PoolWrapperAllowanceState>(() => {
    return {
      [networkInstance]: {
        [poxContracts['Pox4']]: true,
        [poxContracts['WrapperFastPool']]:
          getAllowanceContractCallersFastPoolQuery?.data?.type === ClarityType.OptionalSome,
        [poxContracts['WrapperRestake']]:
          getAllowanceContractCallersRestakeQuery?.data?.type === ClarityType.OptionalSome,
        [poxContracts['WrapperOneCycle']]:
          getAllowanceContractCallersOneCycleQuery?.data?.type === ClarityType.OptionalSome,
      },
    };
  }, [
    poxContracts,
    networkInstance,
    getAllowanceContractCallersFastPoolQuery?.data?.type,
    getAllowanceContractCallersRestakeQuery?.data?.type,
    getAllowanceContractCallersOneCycleQuery?.data?.type,
  ]);

  const formMethods = useForm<StackingPoolFormSchema>({
    mode: 'onTouched',
    defaultValues: {
      ...initialStackingFormValues,
      rewardAddress: btcAddressP2wpkh?.address,
    },
    resolver: zodResolver(schema),
  });

  const handleAllowance = formMethods.handleSubmit(async () => {
    return handleAllowContractCallerSubmit();
  });

  const handleDelegate = formMethods.handleSubmit(values => {
    return handleDelegateStxSubmit({
      ...values,
      providerId: pool.providerId,
      delegationDurationType: 'limited',
      numberOfCycles: 1,
      poolAddress: poolStxAddress ?? '',
    }).then(() => navigate(`/stacking/pool/${poolSlug}/active`));
  });

  const allowContractCallerConfirmed = useMemo(() => {
    const confirmed = isAllowContractCallerConfirmed(
      pool.providerId,
      network,
      hasUserConfirmedPoolWrapperContract
    );

    return confirmed;
  }, [hasUserConfirmedPoolWrapperContract, network, pool.providerId]);

  const poolAmount = formMethods.watch('amount');

  // Get posts with direct access
  const posts = getPosts();
  const stackingAmountPost = posts.stackingAmount;
  const stackingRewardsAddressPost = posts.stackingRewardsAddress;
  const stackingDurationPost = posts.stackingDuration;
  const stackingContractDetailsPost = posts.stackingContractDetails;
  const pooledStackingConditionsPost = posts.pooledStackingConditions;

  if (getSecondsUntilNextCycleQuery.isLoading || poolInfo.isLoading) {
    return (
      <Flex height="100vh" width="100%">
        <LoadingSpinner />
      </Flex>
    );
  }

  function onSubmit(confirmation: PooledStackingConfirmationStepId) {
    if (confirmation === 'terms') {
      setTermsConfirmed(v => !v);
      return;
    }
    if (confirmation === 'allowContractCaller') {
      return handleAllowance();
    }
    if (confirmation === 'delegateStx') {
      return handleDelegate();
    }

    throw new Error(`Unknown confirmation type: ${confirmation}`);
  }

  // Helper to map PoolRewardProtocolInfo to StackingPool
  function mapPoolRewardProtocolInfoToStackingPool(info: any): import('~/data/data').StackingPool {
    const minimumDelegationAmount = info.minCommitment
      ? Math.round(info.minCommitment * 1000000)
      : 0;

    const mappedPool = {
      providerId: info.id || '',
      name: info.title || '',
      url: info.url || '',
      minAmount: info.minCommitment || null, // This stays in STX units
      estApr: info.apr || '',
      payout: info.rewardsToken || '',
      disabled: false,
      description: info.description || '',
      duration: info.minLockupPeriodDays || 1,
      poolAddress: {
        mainnet: info.poolAddress,
        testnet: info.poolAddress,
        devnet: info.poolAddress,
      },
      fee: '',
      poxContract: '',
      rewardsToken: info.rewardsToken || '',
      minimumDelegationAmount: minimumDelegationAmount, // This needs to be in microSTX
      allowCustomRewardAddress: false,
      tvlUsd: info.tvlUsd || '',
      minCommitmentUsd: info.minCommitmentUsd || '',
      icon: info.logo,
      website: info.url || '',

      // Add the missing fields needed for PoolOverview
      nextCycleBlocks: info.nextCycleBlocks || 0,
      nextCycleDays: info.nextCycleDays || 0,
      nextCycleNumber: info.nextCycleNumber || 0,
      minLockupPeriodDays: info.minLockupPeriodDays || 1,
      tvl: info.tvl || '',
    };

    return mappedPool;
  }

  const { poolRewardProtocolInfo } = poolInfo;

  return (
    <Stack gap={['space.06', 'space.06', 'space.06', 'space.09']} mb="space.07">
      {poolRewardProtocolInfo && (
        <Page.Inset>
          <PoolOverview
            pool={mapPoolRewardProtocolInfoToStackingPool(poolRewardProtocolInfo)}
            poolSlug={poolSlug}
          />
        </Page.Inset>
      )}

      <FormProvider {...formMethods}>
        <StartStackingLayout
          stackingForm={
            <Form>
              <Stack gap={['space.05', 'space.05', 'space.05', 'space.07']}>
                <Stack gap="space.02">
                  <StackingFormItemTitle title="Amount" post={stackingAmountPost} />
                  <ChoosePoolingAmount
                    availableAmount={totalAvailableBalance.amount}
                    isLoading={totalAvailableBalanceIsLoading}
                    stackedAmount={stackedAmount}
                  />
                </Stack>

                {poolRewardProtocolInfo?.rewardsToken === 'BTC' && (
                  <Stack gap="space.02">
                    <StackingFormItemTitle
                      title="Address to receive rewards"
                      post={stackingRewardsAddressPost}
                    />
                    <ChooseRewardsAddress
                      disabled={!poolRewardProtocolInfo.allowCustomRewardAddress}
                    />
                    <styled.span textStyle="caption.01" color="ink.text-subdued">
                      This is where the pool will deposit your rewards each cycle.
                    </styled.span>
                  </Stack>
                )}

                <Hr />

                <Stack gap="space.02">
                  <StackingFormItemTitle title="Duration" post={stackingDurationPost} />
                  <ChoosePoolingDuration />
                </Stack>

                <Hr />

                <Stack gap="space.02">
                  <StackingFormItemTitle title="Details" post={stackingContractDetailsPost} />
                  <StackingContractDetails
                    addressTitle="Pool address"
                    address={poolStxAddress}
                    contractAddress={poxWrapperContract}
                  />
                </Stack>

                <Hr />

                <Stack gap="space.04">
                  <StackingFormItemTitle
                    title="Pooling conditions"
                    post={pooledStackingConditionsPost}
                  />
                  <ChoosePoolingConditions />
                </Stack>

                <Button
                  px="space.06"
                  size="sm"
                  width="100%"
                  display={['block', null, 'none']}
                  onClick={() => setDrawerOpen(true)}
                >
                  Review
                </Button>
              </Stack>
            </Form>
          }
          stackingStepsPanel={
            <StackingFormStepsPanel>
              <PooledStackingConfirmationSteps
                onSubmit={onSubmit}
                confirmationState={{
                  terms: {
                    accepted: termsConfirmed,
                    loading: false,
                    visible: true,
                  },
                  allowContractCaller: {
                    accepted: Boolean(allowContractCallerConfirmed || allowContractCallerResult),
                    loading: handleAllowContractCallerSubmitPending,
                    visible: requiresAllowContractCaller(pool.providerId),
                  },
                  delegateStx: {
                    accepted: Boolean(delegateStxResult),
                    loading: handleDelegateStxPending,
                    visible: true,
                  },
                }}
                poolAmount={poolAmount}
              />
            </StackingFormStepsPanel>
          }
        />
      </FormProvider>

      <StartStackingDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
        <PooledStackingConfirmationSteps
          onSubmit={onSubmit}
          confirmationState={{
            terms: {
              accepted: termsConfirmed,
              loading: false,
              visible: true,
            },
            allowContractCaller: {
              accepted: Boolean(allowContractCallerConfirmed || allowContractCallerResult),
              loading: handleAllowContractCallerSubmitPending,
              visible: requiresAllowContractCaller(pool.providerId),
            },
            delegateStx: {
              accepted: Boolean(delegateStxResult),
              loading: handleDelegateStxPending,
              visible: true,
            },
          }}
          poolAmount={poolAmount}
        />
      </StartStackingDrawer>
    </Stack>
  );
}
