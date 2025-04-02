import { useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';

import { ClarityType } from '@stacks/transactions';
import { Stack } from 'leather-styles/jsx';
import { ChoosePoolingAmount } from '~/features/stacking/components/choose-pooling-amount';
import { StackingFormInfoPanel } from '~/features/stacking/components/stacking-form-info-panel';
import { StartStackingLayout } from '~/features/stacking/components/stacking-layout';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import { getPoxContracts } from '~/features/stacking/utils/utils-preset-pools';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

import { Spinner } from '@leather.io/ui';

import { ChoosePoolingConditions } from './components/choose-pooling-conditions';
import { ChoosePoolingDuration } from './components/choose-pooling-duration';
import { ChooseRewardsAddress } from './components/choose-rewards-address';
import { PoolingDetails } from './components/pooling-details';
import { StackingFormItemTitle } from './components/stacking-form-item-title';
import {
  useGetAllowanceContractCallersQuery,
  useGetSecondsUntilNextCycleQuery,
} from './hooks/stacking.query';
import { PoolWrapperAllowanceState, StackingFormValues } from './utils/types';
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

const initialStackingFormValues: Partial<StackingFormValues> = {
  amount: '',
  numberOfCycles: 1,
  poolAddress: '',
};

interface StartPooledStackingLayoutProps {
  poolName: PoolName;
}

// eslint-disable-next-line no-empty-pattern
function StartPooledStackingLayout({}: StartPooledStackingLayoutProps) {
  const { stxAddress, btcAddressP2wpkh } = useLeatherConnect();
  const { network, networkInstance } = useStacksNetwork();
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

  const formMethods = useForm<StackingFormValues>({
    defaultValues: {
      ...initialStackingFormValues,
      rewardAddress: btcAddressP2wpkh?.address,
    },
  });

  if (getSecondsUntilNextCycleQuery.isLoading) return <Spinner />;

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
                <PoolingDetails />
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
