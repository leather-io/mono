import { useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { ClarityType } from '@stacks/transactions';
import { Stack } from 'leather-styles/jsx';
import { ChoosePoolingAmount } from '~/features/stacking/components/choose-pooling-amount';
import { StackingFormInfoPanel } from '~/features/stacking/components/stacking-form-info-panel';
import { StartStackingLayout } from '~/features/stacking/components/stacking-layout';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import {
  getPoxContracts,
  getPoxWrapperContract2,
} from '~/features/stacking/utils/utils-preset-pools';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

import { Spinner } from '@leather.io/ui';

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
import {
  StackingPoolFormSchema,
  createStackingPoolFormSchema,
} from './utils/stacking-pool-form-schema';
import { PoolWrapperAllowanceState } from './utils/types';
import { PoolName } from './utils/types-preset-pools';

interface StartPooledStackingProps {
  poolName: PoolName;
}

export function StartPooledStacking({ poolName }: StartPooledStackingProps) {
  const { client } = useStackingClient();
  const { stxAddress } = useLeatherConnect();

  if (!stxAddress || !client) {
    return 'You should connect STX wallet';
  }
  if (!client) {
    return 'Expected client to be defined';
  }

  return <StartPooledStackingLayout poolName={poolName} />;
}

const initialStackingFormValues: Partial<StackingPoolFormSchema> = {
  amount: '',
  // numberOfCycles: 1,
  // poolAddress: '',
};

interface StartPooledStackingLayoutProps {
  poolName: PoolName;
}

function StartPooledStackingLayout({ poolName }: StartPooledStackingLayoutProps) {
  const { stxAddress, btcAddressP2wpkh } = useLeatherConnect();
  const { network, networkInstance, networkPreference } = useStacksNetwork();
  const poxContracts = getPoxContracts(network);

  const getSecondsUntilNextCycleQuery = useGetSecondsUntilNextCycleQuery();

  const [contractAddress, contractName] = getPoxContracts(network)['Pox4'].split('.');

  const getAllowanceContractCallersFastPoolQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperFastPool'],
    senderAddress: stxAddress ? stxAddress.address : null,
    network,
  });

  const getAllowanceContractCallersRestakeQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperRestake'],
    senderAddress: stxAddress ? stxAddress.address : null,
    network,
  });

  const getAllowanceContractCallersOneCycleQuery = useGetAllowanceContractCallersQuery({
    contractAddress,
    contractName,
    callingContract: poxContracts['WrapperOneCycle'],
    senderAddress: stxAddress ? stxAddress.address : null,
    network,
  });

  const poxInfoQuery = useGetPoxInfoQuery();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasUserConfirmedPoolWrapperContract, setHasUserConfirmedPoolWrapperContract] =
    useState<PoolWrapperAllowanceState>({});

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const poolsContractsAllowanceState = useMemo(
    () => ({
      [networkInstance]: {
        [poxContracts['Pox4']]: true,
        [poxContracts['WrapperFastPool']]:
          getAllowanceContractCallersFastPoolQuery?.data?.type === ClarityType.OptionalSome,
        [poxContracts['WrapperRestake']]:
          getAllowanceContractCallersRestakeQuery?.data?.type === ClarityType.OptionalSome,
        [poxContracts['WrapperOneCycle']]:
          getAllowanceContractCallersOneCycleQuery?.data?.type === ClarityType.OptionalSome,
      },
    }),
    [
      networkInstance,
      poxContracts,
      getAllowanceContractCallersFastPoolQuery?.data?.type,
      getAllowanceContractCallersRestakeQuery?.data?.type,
      getAllowanceContractCallersOneCycleQuery?.data?.type,
    ]
  );

  const schema = useMemo(
    () => createStackingPoolFormSchema({ networkMode: networkPreference.chain.bitcoin.mode }),
    [networkPreference]
  );

  const formMethods = useForm<StackingPoolFormSchema>({
    defaultValues: {
      ...initialStackingFormValues,
      rewardAddress: btcAddressP2wpkh?.address,
    },
    resolver: zodResolver(schema),
  });

  if (getSecondsUntilNextCycleQuery.isLoading) return <Spinner />;

  const pool = pools[poolName];
  const poolStxAddress = pool.poolAddress?.[networkInstance];
  const poxWrapperContract =
    (pool?.poxContract ? getPoxWrapperContract2(networkInstance, pool.poxContract) : undefined) ||
    poxInfoQuery.data?.contract_id;

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
              </Stack>

              <Stack gap="space.02">
                <StackingFormItemTitle title="Duration" />
                <ChoosePoolingDuration />
              </Stack>

              <Stack gap="space.02">
                <StackingFormItemTitle title="Details" />
                <PoolingDetails poolAddress={poolStxAddress} contractAddress={poxWrapperContract} />
              </Stack>

              <Stack gap="space.02">
                <StackingFormItemTitle title="Pooling conditions" />
                <ChoosePoolingConditions />
              </Stack>
            </Stack>
          </Form>
        }
        stackingInfoPanel={<StackingFormInfoPanel>{/*<PoolingInfoCard />*/}</StackingFormInfoPanel>}
      />
    </FormProvider>
  );
}
