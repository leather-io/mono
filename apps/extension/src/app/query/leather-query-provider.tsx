import { type ReactNode, createContext, useContext, useMemo } from 'react';

import { ChainId } from '@stacks/network';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NetworkConfiguration, NetworkModes } from '@leather.io/models';

const LeatherNetworkContext = createContext<NetworkConfiguration | null>(null);

export function useLeatherNetwork(): NetworkConfiguration {
  const leatherNetwork = useContext(LeatherNetworkContext);

  if (!leatherNetwork) {
    throw new Error('No LeatherNetwork set, use LeatherQueryProvider to set one');
  }

  return leatherNetwork;
}

interface NetworkState extends NetworkConfiguration {
  isTestnet: boolean;
  mode: NetworkModes;
}

export function useCurrentNetworkState(): NetworkState {
  const currentNetwork = useLeatherNetwork();

  return useMemo(() => {
    const isTestnet = currentNetwork.chain.stacks.chainId === ChainId.Testnet;
    const mode = isTestnet ? 'testnet' : 'mainnet';
    return { ...currentNetwork, isTestnet, mode };
  }, [currentNetwork]);
}

interface LeatherQueryProviderArgs {
  client: QueryClient;
  network: NetworkConfiguration;
  children: ReactNode;
}
export function LeatherQueryProvider({ client, network, children }: LeatherQueryProviderArgs) {
  return (
    <LeatherNetworkContext.Provider value={network}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </LeatherNetworkContext.Provider>
  );
}
