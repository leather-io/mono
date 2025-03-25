import { ChainId, StacksNetworkName } from '@stacks/network';

export interface Network {
  label: string;
  url: string;
  networkId: ChainId;
  mode: StacksNetworkName;
  wsUrl?: string;
  isCustomNetwork?: boolean;
}

interface WhenStacksNetworkMap<T> {
  mainnet: T;
  testnet: T;
  devnet: T;
  mocknet: T;
}

export function whenStacksNetwork(mode: StacksNetworkName) {
  return <T>(modeMap: WhenStacksNetworkMap<T>): T => modeMap[mode];
}
