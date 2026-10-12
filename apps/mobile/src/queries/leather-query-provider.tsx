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

function isStacksTestnet(network: NetworkConfiguration) {
  return network.chain.stacks.chainId === ChainId.Testnet;
}
function getStacksNetworkMode(network: NetworkConfiguration) {
  return isStacksTestnet(network) ? 'testnet' : 'mainnet';
}

export function useCurrentNetworkState(): NetworkState {
  const currentNetwork = useLeatherNetwork();
  // SMELL: does this even support Bitcoin testnet?
  return useMemo(() => {
    const isTestnet = isStacksTestnet(currentNetwork);
    const mode = getStacksNetworkMode(currentNetwork);
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
