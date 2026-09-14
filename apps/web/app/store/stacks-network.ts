import { StacksNetworkName, networkFrom } from '@stacks/network';
import { useAtom } from 'jotai/index';
import { atomWithStorage } from 'jotai/utils';
import { resolveNetworkConfiguration } from '~/features/multisig/network/resolve-network-configuration';
import { getNetworkInstance } from '~/features/stacking/utils/stacking-network-utils';

export const networkNameAtom = atomWithStorage<StacksNetworkName>('network', 'mainnet');

export function useStacksNetwork() {
  const [networkName, setNetworkName] = useAtom(networkNameAtom);

  const network = networkFrom(networkName);

  const networkInstance = getNetworkInstance(network);

  const networkPreference = resolveNetworkConfiguration(
    networkName === 'mocknet' ? 'testnet' : networkName
  );

  return {
    networkName,
    setNetworkName,
    network,
    networkInstance,
    networkPreference,
    networkLabel: networkName, // TODO: Use AppContextProvider networks from leather/earn
  };
}
