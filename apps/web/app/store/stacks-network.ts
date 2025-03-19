import {
  STACKS_DEVNET,
  STACKS_MAINNET,
  STACKS_MOCKNET,
  STACKS_TESTNET,
  StacksNetworkName,
  networkFrom,
} from '@stacks/network';
import { useAtom } from 'jotai/index';
import { atomWithStorage } from 'jotai/utils';
import { getNetworkInstance } from '~/features/stacking/utils/utils-preset-pools';
import { whenStacksNetworkMode } from '~/types/network';

export const networkNameAtom = atomWithStorage<StacksNetworkName>('network', 'mainnet');

export function useStacksNetwork() {
  const [networkName, setNetworkName] = useAtom(networkNameAtom);

  const network = whenStacksNetworkMode(networkName)({
    mainnet: networkFrom(STACKS_MAINNET),
    testnet: networkFrom(STACKS_TESTNET),
    devnet: networkFrom(STACKS_DEVNET),
    mocknet: networkFrom(STACKS_MOCKNET),
  });

  const networkInstance = getNetworkInstance(network);

  return {
    networkName,
    setNetworkName,
    network,
    networkInstance,
    networkLabel: networkName, // TODO: Use AppContextProvider networks from leather/earn
  };
}
