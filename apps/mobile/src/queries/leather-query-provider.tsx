import { type ReactNode, createContext, useContext, useMemo } from 'react';

import { ChainId } from '@stacks/network';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NetworkConfiguration, NetworkModes } from '@leather.io/models';
import type { RemoteConfig } from '@leather.io/query';

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

export function useLeatherNetwork(): NetworkConfiguration {
  const leatherNetwork = useContext(LeatherNetworkContext);

  if (!leatherNetwork) {
    throw new Error('No LeatherNetwork set, use LeatherQueryProvider to set one');
  }

  return leatherNetwork;
}

export interface NetworkState extends NetworkConfiguration {
  isTestnet: boolean;
  mode: NetworkModes;
}

function isStacksTestnet(network: NetworkConfiguration) {
  return network.chain.stacks.chainId === ChainId.Testnet;
}
export function getStacksNetworkMode(network: NetworkConfiguration) {
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
  environment: LeatherEnvironment;
}
export function LeatherQueryProvider({
  client,
  network,
  children,
  environment,
}: LeatherQueryProviderArgs) {
  return (
    <LeatherNetworkContext.Provider value={network}>
      <LeatherEnvironmentContext.Provider value={environment}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </LeatherEnvironmentContext.Provider>
    </LeatherNetworkContext.Provider>
  );
}
