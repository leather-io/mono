import { useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { StackingClient } from '@stacks/stacking';
import { ClarityType } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import { Stack, styled } from 'leather-styles/jsx';
import { ChoosePoolingAmount } from '~/features/stacking/components/choose-pooling-amount';
import { StackingFormStepsPanel } from '~/features/stacking/components/stacking-form-steps-panel';
import { StartStackingLayout } from '~/features/stacking/components/stacking-layout';
import {
  ConfirmationStepType,
  StackingStepsCard,
} from '~/features/stacking/components/stacking-steps-card';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import {
  createAllowContractCallerSubmitMutationOptions,
  isAllowContractCallerConfirmed,
} from '~/features/stacking/utils/utils-allow-contract-caller';
import { createDelegateStxMutationOptions } from '~/features/stacking/utils/utils-delegate-stx';
import {
  getPoxContracts,
  getPoxWrapperContract2,
  requiresAllowContractCaller,
} from '~/features/stacking/utils/utils-preset-pools';
import { leather } from '~/helpers/leather-sdk';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

import { Hr, Spinner } from '@leather.io/ui';

import { ChoosePoolingConditions } from './components/choose-pooling-conditions';
import { ChoosePoolingDuration } from './components/choose-pooling-duration';
import { ChooseRewardsAddress } from './components/choose-rewards-address';
import { PoolingDetails } from './components/pooling-details';
import { pools } from './components/preset-pools';
import { StackingFormItemTitle } from './components/stacking-form-item-title';
import {
  useGetAllowanceContractCallersQuery,
  useGetPoxInfoQuery,
  useGetSecondsUntilNextCycleQuery,
} from './hooks/stacking.query';
import { StackingPoolFormSchema, createValidationSchema } from './utils/stacking-pool-form-schema';
import { PoolWrapperAllowanceState } from './utils/types';
import { PoolName, WrapperPrincipal } from './utils/types-preset-pools';

interface StartPooledStackingProps {
  poolName: PoolName;
}
export function StartPooledStacking({ poolName }: StartPooledStackingProps) {
  const { client } = useStackingClient();
  const { stacksAccount: stxAddress } = useLeatherConnect();

  if (!stxAddress || !client) {
    return 'You should connect STX wallet';
  }
  if (!client) {
    return 'Expected client to be defined';
  }

  return <StartPooledStackingLayout client={client} poolName={poolName} />;
}

const initialStackingFormValues: Partial<StackingPoolFormSchema> = {
  // amount: '',
  // numberOfCycles: 1,
  // poolAddress: '',
};

interface StartPooledStackingLayoutProps {
  poolName: PoolName;
  client: StackingClient;
}

function StartPooledStackingLayout({ poolName, client }: StartPooledStackingLayoutProps) {
  const { stacksAccount, btcAddressP2wpkh } = useLeatherConnect();
  const { network, networkInstance, networkPreference } = useStacksNetwork();
  const poxContracts = useMemo(() => getPoxContracts(network), [network]);

  const getSecondsUntilNextCycleQuery = useGetSecondsUntilNextCycleQuery();

  const [contractAddress, contractName] = getPoxContracts(network)['Pox4'].split('.');

  const getAllowanceContractCallersFastPoolQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperFastPool'],
    senderAddress: stacksAccount ? stacksAccount.address : null,
    network,
  });

  const getAllowanceContractCallersRestakeQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperRestake'],
    senderAddress: stacksAccount ? stacksAccount.address : null,
    network,
  });

  const getAllowanceContractCallersOneCycleQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperOneCycle'],
    senderAddress: stacksAccount ? stacksAccount.address : null,
    network,
  });

  const poxInfoQuery = useGetPoxInfoQuery();

  const pool = pools[poolName];
  const poolStxAddress = pool.poolAddress?.[networkInstance];
  const poxWrapperContract =
    (pool?.poxContract ? getPoxWrapperContract2(networkInstance, pool.poxContract) : undefined) ||
    (poxInfoQuery.data?.contract_id as WrapperPrincipal);

  const schema = useMemo(
    () => createValidationSchema({ networkMode: networkPreference.chain.bitcoin.mode, poolName }),
    [networkPreference.chain.bitcoin.mode, poolName]
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

  if (getSecondsUntilNextCycleQuery.isLoading) return <Spinner />;

  function onSubmit(confirmation: ConfirmationStepType) {
    if (confirmation === 'terms') {
      setTermsConfirmed(v => !v);
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
    <FormProvider {...formMethods}>
      <StartStackingLayout
        stackingForm={
          <Form>
            <Stack gap="space.07">
              <Stack gap="space.02">
                <StackingFormItemTitle title="Amount" />
                <ChoosePoolingAmount />
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
                <PoolingDetails poolAddress={poolStxAddress} contractAddress={poxWrapperContract} />
              </Stack>

              <Hr />

              <Stack gap="space.02">
                <StackingFormItemTitle title="Pooling conditions" />
                <ChoosePoolingConditions />
              </Stack>
            </Stack>
          </Form>
        }
        stackingStepsPanel={
          <StackingFormStepsPanel>
            <StackingStepsCard
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
  );
}
