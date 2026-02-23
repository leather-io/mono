import { useNetworkPreferenceStacksNetwork, useSettings } from '@/store/settings/settings';
import { getStacksNetworkFromName } from '@/store/settings/settings.read';
import { StacksNetwork, StacksNetworks } from '@stacks/network';

import { NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

interface GetBtcNetworkFromRequestParams {
  paramsNetwork: string | undefined;
  defaultNetwork: NetworkConfiguration;
}

function getBtcNetworkFromRequestParams({
  paramsNetwork,
  defaultNetwork,
}: GetBtcNetworkFromRequestParams) {
  if (paramsNetwork) {
    // default to testnet4 if rpc request specifies "testnet"
    if (paramsNetwork === 'testnet') return defaultNetworksKeyedById.testnet4;
    const foundNetwork = Object.values(defaultNetworksKeyedById).find(network => {
      return network.chain.bitcoin.bitcoinNetwork === paramsNetwork;
    });

    if (foundNetwork) {
      return foundNetwork;
    }
    throw new Error('Wrong network supplied in the rpc request params: ' + paramsNetwork);
  }

  return defaultNetwork;
}

export function useGetBtcNetworkFromRequestParams(paramsNetwork: string | undefined) {
  const { networkPreference } = useSettings();
  return getBtcNetworkFromRequestParams({ paramsNetwork, defaultNetwork: networkPreference });
}

interface GetStxNetworkFromRequestParams {
  paramsNetwork: string | undefined;
  defaultNetwork: StacksNetwork;
}

function getStxNetworkFromRequestParams({
  paramsNetwork,
  defaultNetwork,
}: GetStxNetworkFromRequestParams) {
  if (paramsNetwork) {
    const stacksNetworkName = StacksNetworks.find(n => n === paramsNetwork);
    if (stacksNetworkName) {
      return getStacksNetworkFromName(stacksNetworkName);
    }
    throw new Error('Wrong network supplied in the rpc request params: ' + paramsNetwork);
  }

  return defaultNetwork;
}

export function useGetStxNetworkFromRequestParams(paramsNetwork: string | undefined) {
  const defaultNetwork = useNetworkPreferenceStacksNetwork();

  return getStxNetworkFromRequestParams({ paramsNetwork, defaultNetwork });
}
