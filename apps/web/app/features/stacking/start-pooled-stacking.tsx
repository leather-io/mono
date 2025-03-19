import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { StacksNetworkName } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { ClarityType } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import { styled } from 'leather-styles/jsx';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import { getPoxContracts } from '~/features/stacking/utils/utils-preset-pools';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

import {
  createGetAllowanceContractCallersQueryOptions,
  createGetSecondsUntilNextCycleQueryOptions,
} from '@leather.io/query';
import { Spinner } from '@leather.io/ui';

import { ChoosePoolingPool } from './components/choose-pooling-pool';
import { PoolWrapperAllowanceState } from './utils/types';

export function StartPooledStacking() {
  const { client } = useStackingClient();
  const { networkName } = useStacksNetwork();
  const { stxAddress } = useLeatherConnect();

  if (!stxAddress || !client) {
    return 'You should connect STX wallet';
  }
  if (!client) {
    return 'Expected client to be defined';
  }

  return <StartPooledStackingLayout client={client} networkName={networkName} />;
}

interface StartPooledStackingProps {
  client: StackingClient;
  networkName: StacksNetworkName;
}
function StartPooledStackingLayout({ client }: StartPooledStackingProps) {
  const { stxAddress } = useLeatherConnect();
  const { network, networkInstance } = useStacksNetwork();
  const poxContracts = getPoxContracts(network);

  const getSecondsUntilNextCycleQuery = useQuery(
    createGetSecondsUntilNextCycleQueryOptions({ client })
  );

  const [contractAddress, contractName] = getPoxContracts(network)['Pox4'].split('.');

  const getAllowanceContractCallersFastPoolQuery = useQuery(
    createGetAllowanceContractCallersQueryOptions({
      contractAddress,
      contractName,
      callingContract: poxContracts['WrapperFastPool'],
      senderAddress: stxAddress ? stxAddress.address : null,
      network,
    })
  );

  const getAllowanceContractCallersRestakeQuery = useQuery(
    createGetAllowanceContractCallersQueryOptions({
      contractAddress,
      contractName,
      callingContract: poxContracts['WrapperRestake'],
      senderAddress: stxAddress ? stxAddress.address : null,
      network,
    })
  );

  const getAllowanceContractCallersOneCycleQuery = useQuery(
    createGetAllowanceContractCallersQueryOptions({
      contractAddress,
      contractName,
      callingContract: poxContracts['WrapperOneCycle'],
      senderAddress: stxAddress ? stxAddress.address : null,
      network,
    })
  );

  const [hasUserConfirmedPoolWrapperContract, setHasUserConfirmedPoolWrapperContract] =
    useState<PoolWrapperAllowanceState>({});

  useEffect(() => {
    setHasUserConfirmedPoolWrapperContract(confirmed => {
      return {
        ...confirmed,
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
    });
  }, [
    poxContracts,
    networkInstance,
    getAllowanceContractCallersFastPoolQuery?.data?.type,
    getAllowanceContractCallersRestakeQuery?.data?.type,
    getAllowanceContractCallersOneCycleQuery?.data?.type,
    setHasUserConfirmedPoolWrapperContract,
  ]);

  const formMethods = useForm({
    defaultValues: {
      poolName: 'FAST Pool',
    },
  });

  if (getSecondsUntilNextCycleQuery.isLoading) return <Spinner />;

  return (
    <FormProvider {...formMethods}>
      <ChoosePoolingPool onPoolChange={poolName => alert(poolName)} />
      <styled.pre>
        {String(JSON.stringify(hasUserConfirmedPoolWrapperContract, null, 2))}
      </styled.pre>
    </FormProvider>
  );
}
