import { useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { useStacksClient } from '../stacks-client';
import { createGetStacksAccountBalanceQueryOptions } from './account-balance.query';
import { createStxMoney } from './create-stx-money';

export function useStxBalanceQuery(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery({
    ...createGetStacksAccountBalanceQueryOptions({
      address,
      client,
      network: network.chain.stacks.url,
    }),
    select: resp => createStxMoney(resp),
  });
}
