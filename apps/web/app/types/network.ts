import { ChainId, StacksNetworkName } from '@stacks/network';

export interface Network {
  label: string;
  url: string;
  networkId: ChainId;
  mode: StacksNetworkName;
  wsUrl?: string;
  isCustomNetwork?: boolean;
}

interface WhenStacksChainIdMap<T> {
  [ChainId.Mainnet]: T;
  [ChainId.Testnet]: T;
}
export function whenStacksChainId(chainId: ChainId) {
  return <T>(chainIdMap: WhenStacksChainIdMap<T>): T => chainIdMap[chainId];
}
interface WhenStacksModeMap<T> {
  mainnet: T;
  testnet: T;
  devnet: T;
  mocknet: T;
}
export function whenStacksNetworkMode(mode: StacksNetworkName) {
  return <T>(modeMap: WhenStacksModeMap<T>): T => modeMap[mode];
}
