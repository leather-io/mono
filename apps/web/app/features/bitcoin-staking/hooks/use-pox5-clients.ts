import { useMemo } from 'react';

import { StackingClient } from '@stacks/stacking';
import { validateStacksAddress as isValidStacksAddress } from '@stacks/transactions';
import { POX5_DEVNET_API_URL } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useLeatherConnect } from '~/store/addresses';
import { fetchFn } from '~/utils/hiro-wrapped-fetch';

import { StacksClient, stacksClient } from '@leather.io/query';

// Clients pinned to the pox-5 devnet API. pox-5 reads must never go through
// the app-network clients — they would report state (balances, burn heights,
// positions) from the wrong chain.
export function usePox5StacksClient(): StacksClient {
  return stacksClient(POX5_DEVNET_API_URL);
}

export function usePox5StackingClient(): StackingClient | null {
  const { stacksAccount } = useLeatherConnect();

  return useMemo(() => {
    if (!stacksAccount || !isValidStacksAddress(stacksAccount.address)) return null;
    return new StackingClient({
      address: stacksAccount.address,
      network: 'devnet',
      client: { baseUrl: POX5_DEVNET_API_URL, fetch: fetchFn },
    });
  }, [stacksAccount]);
}

export function usePox5StackingClientRequired(): StackingClient {
  const client = usePox5StackingClient();
  if (!client) throw new Error('Expected to have a pox-5 StackingClient available.');
  return client;
}
