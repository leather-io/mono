import { ChainID } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import type { AppUseQueryConfig } from '../../query-config';
import { useStacksClient } from '../stacks-client';
import type { Stx20Balance } from '../stx20-api-types';

export function useStx20BalancesQuery<T extends unknown = Stx20Balance[]>(
  address: string,
  options?: AppUseQueryConfig<Stx20Balance[], T>
) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery({
    enabled: network.chain.stacks.chainId === ChainID.Mainnet,
    queryKey: ['stx20-balances', address],
    queryFn: () => client.getStx20Balances(address),
    ...options,
  });
}
