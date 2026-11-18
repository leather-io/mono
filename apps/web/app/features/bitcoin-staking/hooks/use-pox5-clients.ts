import { useMemo } from 'react';

import { StackingClient } from '@stacks/stacking';
import { validateStacksAddress as isValidStacksAddress } from '@stacks/transactions';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { useLeatherConnect } from '~/store/addresses';
import { fetchFn } from '~/utils/hiro-wrapped-fetch';
import { type StacksApiClient, createStacksApiClient } from '~/utils/stacks-api-client';

import { parseContractId } from '../utils/contract-id';
import { getPox5ContractId } from '../utils/pox5-contracts';

// Clients pinned to the configured pox-5 chain. pox-5 reads must never go
// through the app-network clients — they would report state (balances, burn
// heights, positions) from the wrong chain.
export function usePox5StacksClient(): StacksApiClient {
  return createStacksApiClient(pox5NetworkConfig.apiUrl);
}

export function usePox5StackingClient(): StackingClient | null {
  const { stacksAccount } = useLeatherConnect();

  return useMemo(() => {
    if (!stacksAccount || !isValidStacksAddress(stacksAccount.address)) return null;
    return new StackingClient({
      address: stacksAccount.address,
      network: pox5NetworkConfig.stacksNetworkName,
      client: { baseUrl: pox5NetworkConfig.apiUrl, fetch: fetchFn },
    });
  }, [stacksAccount]);
}

export function usePox5StackingClientRequired(): StackingClient {
  const client = usePox5StackingClient();
  if (!client) throw new Error('Expected to have a pox-5 StackingClient available.');
  return client;
}

// For chain-level reads only (pox info, burn heights, cycle timing): the
// address is a required constructor argument these reads never consult, so the
// pox-5 deployer stands in and the client exists with or without a wallet.
export function usePox5ChainStackingClient(): StackingClient {
  return useMemo(() => {
    const pox5 = parseContractId(getPox5ContractId(pox5NetworkConfig.contractNetworkMode));
    return new StackingClient({
      address: pox5.contractAddress,
      network: pox5NetworkConfig.stacksNetworkName,
      client: { baseUrl: pox5NetworkConfig.apiUrl, fetch: fetchFn },
    });
  }, []);
}
