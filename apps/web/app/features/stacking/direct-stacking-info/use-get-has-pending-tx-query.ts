import { useQuery } from '@tanstack/react-query';
import { useStackingClientRequired } from '~/features/stacking/providers/stacking-client-provider';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

import { getHasPendingDirectStacking } from './get-has-pending-direct-stacking';
import { getHasPendingStackExtend } from './get-has-pending-stack-extend';
import { getHasPendingStackIncrease } from './get-has-pending-stack-increase';

export function useGetHasPendingStackingTransactionQuery() {
  const { client } = useStackingClientRequired();
  const { stacksAccount } = useLeatherConnect();
  const { networkName } = useStacksNetwork();
  const stacksClient = useStacksClient();

  const address = stacksAccount?.address;

  if (!address) {
    // TODO: report error
    throw new Error('Expected `address` to be defined.');
  }

  const getHasPendingDirectStackingQuery = useQuery({
    queryKey: ['pending-stacking-status', client, stacksClient, address, networkName],
    queryFn: () =>
      getHasPendingDirectStacking({
        stackingClient: client,
        stacksClient,
        address,

        // TODO: better types or type checks to ensure all network names work
        network: networkName as 'mainnet' | 'testnet',
      }),
    refetchInterval: 5000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const getHasPendingStackIncreaseQuery = useQuery({
    queryKey: ['pending-stack-increase', client, stacksClient, address, networkName],
    queryFn: () =>
      getHasPendingStackIncrease({
        stackingClient: client,
        stacksClient,
        address,
      }),
    refetchInterval: 5000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const getHasPendingStackExtendQuery = useQuery({
    queryKey: ['pending-stack-extend', client, stacksClient, address, networkName],
    queryFn: () =>
      getHasPendingStackExtend({
        stackingClient: client,
        stacksClient,
        address,
        network: networkName,
      }),
    refetchInterval: 5000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return {
    getHasPendingDirectStackingQuery,
    getHasPendingStackIncreaseQuery,
    getHasPendingStackExtendQuery,
  };
}
