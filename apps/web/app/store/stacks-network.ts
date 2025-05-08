import { StacksNetworkName, networkFrom } from '@stacks/network';
import { useAtom } from 'jotai/index';
import { atomWithStorage } from 'jotai/utils';
import { getNetworkInstance } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';

import { defaultNetworksKeyedById } from '@leather.io/models';

export const networkNameAtom = atomWithStorage<StacksNetworkName>('network', 'mainnet');

export function useStacksNetwork() {
  const [networkName, setNetworkName] = useAtom(networkNameAtom);

  const network = networkFrom(networkName);

  const networkInstance = getNetworkInstance(network);

  const networkPreference =
    defaultNetworksKeyedById[networkName === 'mocknet' ? 'testnet' : networkName];

  return {
    networkName,
    setNetworkName,
    network,
    networkInstance,
    networkPreference,
    networkLabel: networkName, // TODO: Use AppContextProvider networks from leather/earn
  };
}
