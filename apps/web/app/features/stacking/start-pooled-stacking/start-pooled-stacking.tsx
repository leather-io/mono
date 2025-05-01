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
  getPoxContracts,
  getPoxWrapperContract2,
  requiresAllowContractCaller,
} from '~/features/stacking/start-pooled-stacking/utils/utils-preset-pools';
import { leather } from '~/helpers/leather-sdk';
import {
  useStxAvailableUnlockedBalance,
  useStxCryptoAssetBalance,
} from '~/queries/balance/account-balance.hooks';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

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
import { pools } from './components/preset-pools';
import { StackingPoolFormSchema, createValidationSchema } from './utils/stacking-pool-form-schema';
import { PoolWrapperAllowanceState } from './utils/types';
import {
  PoolIdToDisplayNameMap,
  PoolSlug,
  PoolSlugToIdMap,
  WrapperPrincipal,
} from './utils/types-preset-pools';

interface StartPooledStackingProps {
  poolSlug: PoolSlug;
}

export function StartPooledStacking({ poolSlug }: StartPooledStackingProps) {
  const { client } = useStackingClient();
  const { stacksAccount } = useLeatherConnect();

  if (!stacksAccount || !client) {
    return 'You should connect STX wallet';
  }

  return <StartPooledStackingLayout client={client} poolSlug={poolSlug} />;
}

const initialStackingFormValues: Partial<StackingPoolFormSchema> = {
  // amount: '',
  // numberOfCycles: 1,
  // poolAddress: '',
};

interface StartPooledStackingLayoutProps {
  poolSlug: PoolSlug;
  client: StackingClient;
}

function StartPooledStackingLayout({ poolSlug, client }: StartPooledStackingLayoutProps) {
  const { stacksAccount, btcAddressP2wpkh } = useLeatherConnect();
  if (!stacksAccount) throw new Error('No stx address available');

  const { network, networkInstance, networkPreference } = useStacksNetwork();
  const poxContracts = useMemo(() => getPoxContracts(network), [network]);
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const getSecondsUntilNextCycleQuery = useGetSecondsUntilNextCycleQuery();

  const [contractAddress, contractName] = getPoxContracts(network)['Pox4'].split('.');

  const getAllowanceContractCallersFastPoolQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperFastPool'],
    senderAddress: stacksAccount.address,
    network,
  });

  const getAllowanceContractCallersRestakeQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperRestake'],
    senderAddress: stacksAccount.address,
    network,
  });

  const getAllowanceContractCallersOneCycleQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperOneCycle'],
    senderAddress: stacksAccount.address,
    network,
  });

  const {
    filteredBalanceQuery: { isLoading: totalAvailableBalanceIsLoading },
  } = useStxCryptoAssetBalance(stacksAccount.address);
  const totalAvailableBalance = useStxAvailableUnlockedBalance(stacksAccount.address);

  const poxInfoQuery = useGetPoxInfoQuery();

  const delegationStatusQuery = useDelegationStatusQuery();
  const stackedAmount = useMemo(() => {
    if (delegationStatusQuery.data?.delegated) {
      return new BigNumber(delegationStatusQuery.data.details.amount_micro_stx.toString());
    }
    return undefined;
  }, [delegationStatusQuery.data]);

  const poolId = PoolSlugToIdMap[poolSlug];
  const poolName = PoolIdToDisplayNameMap[poolId];
  const pool = pools[poolName];
  const poolStxAddress = pool.poolAddress?.[networkInstance];
  const poxWrapperContract =
    (pool?.poxContract ? getPoxWrapperContract2(networkInstance, pool.poxContract) : undefined) ||
    (poxInfoQuery.data?.contract_id as WrapperPrincipal);

  const schema = useMemo(
    () =>
      createValidationSchema({
        networkMode: networkPreference.chain.bitcoin.mode,
        poolName,
        availableBalance: totalAvailableBalance,
        stackedAmount,
      }),
    [networkPreference.chain.bitcoin.mode, poolName, totalAvailableBalance, stackedAmount]
  );

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
      poolName,
      delegationDurationType: 'limited',
      numberOfCycles: 1,
      poolAddress: poolStxAddress ?? '',
    }).then(() => {
      return navigate(`/pooled-stacking/${poolSlug}/active`);
    });
  });

  const allowContractCallerConfirmed = useMemo(() => {
    const confirmed = isAllowContractCallerConfirmed(
      poolName,
      network,
      hasUserConfirmedPoolWrapperContract
    );

    return confirmed;
  }, [hasUserConfirmedPoolWrapperContract, network, poolName]);

  const poolAmount = formMethods.watch('amount');

  if (getSecondsUntilNextCycleQuery.isLoading) {
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

  return (
    <Stack>
      <Page.Inset>
        <PoolOverview pool={pool} poolSlug={poolSlug} />
      </Page.Inset>

      <FormProvider {...formMethods}>
        <StartStackingLayout
          stackingForm={
            <Form>
              <Stack
                gap={['space.05', 'space.05', 'space.05', 'space.07']}
                maxWidth={[null, null, '304px', 'none']}
              >
                <Stack gap="space.02">
                  <StackingFormItemTitle title="Amount" />
                  <ChoosePoolingAmount
                    availableAmount={totalAvailableBalance.amount}
                    isLoading={totalAvailableBalanceIsLoading}
                    stackedAmount={stackedAmount}
                  />
                </Stack>

                <Stack gap="space.02">
                  <StackingFormItemTitle title="Address to receive rewards" />
                  <ChooseRewardsAddress />
                  <styled.span textStyle="caption.01" color="ink.text-subdued">
                    This is where the pool will deposit your rewards each cycle.
                  </styled.span>
                </Stack>

                <Hr />

                <Stack gap="space.02">
                  <StackingFormItemTitle title="Duration" />
                  <ChoosePoolingDuration />
                </Stack>

                <Hr />

                <Stack gap="space.02">
                  <StackingFormItemTitle title="Details" />
                  <StackingContractDetails
                    addressTitle="Pool address"
                    address={poolStxAddress}
                    contractAddress={poxWrapperContract}
                  />
                </Stack>

                <Hr />

                <Stack gap="space.02">
                  <StackingFormItemTitle title="Pooling conditions" />
                  <ChoosePoolingConditions />
                </Stack>

                <Button
                  px="space.06"
                  size="sm"
                  width="100%"
                  display={['block', null, 'none']}
                  onClick={() => {
                    setDrawerOpen(true);
                  }}
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
                    visible: requiresAllowContractCaller(poolName),
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
              visible: requiresAllowContractCaller(poolName),
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
