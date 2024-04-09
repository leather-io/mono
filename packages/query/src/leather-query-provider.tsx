import { ReactNode, createContext, useContext, useMemo } from 'react';

import { NetworkConfiguration, NetworkModes } from '@leather-wallet/constants';
import { ChainID } from '@stacks/common';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const LeatherNetworkContext = createContext<NetworkConfiguration | null>(null);

const LeatherEnvironmentContext = createContext<string | null>(null);

export function useLeatherEnv() {
  const leatherEnv = useContext(LeatherEnvironmentContext);

  if (!leatherEnv) {
    throw new Error('No LeatherEnvironment set, use LeatherQueryProvider to set one');
  }

  return leatherEnv;
}

export function useIsLeatherTestingEnv() {
  const leatherEnv = useContext(LeatherEnvironmentContext);

  if (!leatherEnv) {
    throw new Error('No LeatherEnvironment set, use LeatherQueryProvider to set one');
  }

  return leatherEnv === 'testing';
}

export function useLeatherNetwork() {
  const leatherNetwork = useContext(LeatherNetworkContext);

  if (!leatherNetwork) {
    throw new Error('No LeatherNetwork set, use LeatherQueryProvider to set one');
  }

  return leatherNetwork;
}
export function useCurrentNetworkState() {
  const currentNetwork = useLeatherNetwork();

  return useMemo(() => {
    const isTestnet = currentNetwork.chain.stacks.chainId === ChainID.Testnet;
    const mode = (isTestnet ? 'testnet' : 'mainnet') as NetworkModes;
    return { ...currentNetwork, isTestnet, mode };
  }, [currentNetwork]);
}

export function LeatherQueryProvider({
  client,
  network,
  children,
  env,
}: {
  client: QueryClient;
  network: NetworkConfiguration;
  children: ReactNode;
  env: string;
}) {
  return (
    <LeatherNetworkContext.Provider value={network}>
      <LeatherEnvironmentContext.Provider value={env}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </LeatherEnvironmentContext.Provider>
    </LeatherNetworkContext.Provider>
  );
}
