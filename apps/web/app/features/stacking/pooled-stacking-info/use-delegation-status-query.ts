import { StacksNetwork } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

import { StacksClient } from '@leather.io/query';

import { useStackingClientRequired } from '../providers/stacking-client-provider';
import { getDelegationStatus } from './get-delegation-status';

interface UseDelegationStatusForUserQueryArgs {
  client: StackingClient;
  address: string | undefined;
  network: StacksNetwork;
  stacksClient: StacksClient;
}

export function useDelegationStatusQuery() {
  const { client } = useStackingClientRequired();
  const { stacksAccount } = useLeatherConnect();
  const address = stacksAccount?.address;
  const { network } = useStacksNetwork();
  const stacksClient = useStacksClient();

  return useQuery(
    createGetDelegationStatusQueryOptions({ client, address, network, stacksClient })
  );
}

function createGetDelegationStatusQueryOptions({
  client,
  address,
  network,
  stacksClient,
}: UseDelegationStatusForUserQueryArgs) {
  return {
    queryKey: ['delegation-status', client, stacksClient, address, network],
    queryFn: async () =>
      getDelegationStatus({
        stackingClient: client,
        stacksClient,
        address: address!,
        network,
      }),
    refetchInterval: 5000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(address),
  } satisfies UseQueryOptions;
}
