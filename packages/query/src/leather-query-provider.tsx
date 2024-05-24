import { ReactNode, createContext, useContext, useMemo } from 'react';

import { ChainID } from '@stacks/common';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NetworkConfiguration, NetworkModes } from '@leather-wallet/models';

import type { RemoteConfig } from '../types/remote-config';

export interface LeatherEnvironment {
  env: string;
  github: {
    org: string;
    repo: string;
    branchName?: string;
    localConfig?: RemoteConfig;
  };
}

const LeatherNetworkContext = createContext<NetworkConfiguration | null>(null);

const LeatherEnvironmentContext = createContext<LeatherEnvironment | null>(null);

export function useLeatherGithub() {
  const leatherEnv = useContext(LeatherEnvironmentContext);

  if (!leatherEnv) {
    throw new Error('No LeatherEnvironment set, use LeatherQueryProvider to set one');
  }

  return leatherEnv.github;
}

export function useLeatherEnv() {
  const leatherEnv = useContext(LeatherEnvironmentContext);

  if (!leatherEnv || !leatherEnv.env) {
    throw new Error('No LeatherEnvironment set, use LeatherQueryProvider to set one');
  }

  return leatherEnv.env;
}

export function useIsLeatherTestingEnv() {
  const leatherEnv = useContext(LeatherEnvironmentContext);

  if (!leatherEnv || !leatherEnv.env) {
    throw new Error('No LeatherEnvironment set, use LeatherQueryProvider to set one');
  }

  return leatherEnv.env === 'testing';
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
  environment,
}: {
  client: QueryClient;
  network: NetworkConfiguration;
  children: ReactNode;
  environment: LeatherEnvironment;
}) {
  return (
    <LeatherNetworkContext.Provider value={network}>
      <LeatherEnvironmentContext.Provider value={environment}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </LeatherEnvironmentContext.Provider>
    </LeatherNetworkContext.Provider>
  );
}
