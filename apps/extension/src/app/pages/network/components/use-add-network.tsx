import { useState } from 'react';
import { useNavigate } from 'react-router';

import { createFetchFn } from '@stacks/common';
import { ChainId } from '@stacks/network';
import { z } from 'zod';

import {
  type BitcoinNetwork,
  bitcoinNetworkToNetworkMode,
  networkConfigurationSchema,
} from '@leather.io/models';
import { isDefined } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { isValidUrl } from '@shared/utils/urls';

import { useRouteState } from '@app/common/hooks/use-route-state';
import { removeTrailingSlash } from '@app/common/url-join';
import { useNetworksActions } from '@app/store/networks/networks.hooks';
import { useNetworks } from '@app/store/networks/networks.selectors';
import type { PersistedNetworkConfiguration } from '@app/store/networks/networks.slice';

/**
 * The **peer** network ID.
 * Not used in signing, but needed to determine the parent of a subnet.
 */
const PeerNetworkID = {
  Mainnet: 0x17000000,
  Testnet: 0xff000000,
} as const;
type PeerNetworkID = (typeof PeerNetworkID)[keyof typeof PeerNetworkID];

export interface AddNetworkFormValues {
  key: string;
  name: string;
  stacksUrl: string;
  bitcoinUrl: string;
  bitcoinNetwork: BitcoinNetwork;
}

const initialFormValues: AddNetworkFormValues = {
  key: '',
  name: '',
  stacksUrl: '',
  bitcoinUrl: '',
  bitcoinNetwork: 'mainnet',
};

const stacksChainInfoSchema = z.object({
  network_id: z.number().optional().catch(undefined),
  parent_network_id: z.number().optional().catch(undefined),
  l1_subnet_governing_contract: z.string().optional().catch(undefined),
});

const editNetworkRouteStateSchema = z
  .object({ network: networkConfigurationSchema.optional().catch(undefined) })
  .nullish();

function useInitialValues() {
  const network = useRouteState(editNetworkRouteStateSchema)?.network;

  if (!network) {
    return initialFormValues;
  }

  return {
    key: network.id,
    name: network.name,
    stacksUrl: network.chain.stacks.url,
    bitcoinUrl: network.chain.bitcoin.bitcoinUrl,
    bitcoinNetwork: network.chain.bitcoin.bitcoinNetwork,
    mode: network.chain.bitcoin.mode,
  };
}

export function useAddNetwork() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const networksActions = useNetworksActions();
  const networks = useNetworks();
  const initialValues = useInitialValues();
  const fetchFn = createFetchFn();

  function saveNetwork(network: PersistedNetworkConfiguration) {
    if (initialValues.key) {
      networksActions.editNetwork(initialValues.key, network);
      return;
    }
    networksActions.addNetwork(network);
  }

  return {
    error,
    initialFormValues: initialValues,
    loading,
    async onSubmit(values: AddNetworkFormValues) {
      const { name, stacksUrl, bitcoinUrl, key, bitcoinNetwork } = values;

      if (!name) {
        setError('Enter a name');
        return;
      }

      if (!isValidUrl(stacksUrl)) {
        setError('Enter a valid Stacks API URL');
        return;
      }

      if (!isValidUrl(bitcoinUrl)) {
        setError('Enter a valid Bitcoin API URL');
        return;
      }

      if (!key) {
        setError('Enter a unique key');
        return;
      }

      if (key !== initialValues.key && key in networks) {
        setError('A network with this key already exists');
        return;
      }

      setLoading(true);
      setError('');

      const stacksPath = removeTrailingSlash(new URL(values.stacksUrl).href);
      const bitcoinPath = removeTrailingSlash(new URL(values.bitcoinUrl).href);

      try {
        const bitcoinResponse = await fetchFn(`${bitcoinPath}/mempool/recent`);
        if (!bitcoinResponse?.ok) throw new Error('Unable to fetch mempool from bitcoin node');
        const bitcoinMempool: unknown = await bitcoinResponse.json();
        if (!Array.isArray(bitcoinMempool))
          throw new Error('Unable to fetch mempool from bitcoin node');
      } catch {
        setError('Unable to fetch mempool from bitcoin node');
        setLoading(false);
        return;
      }

      let stacksChainInfo: unknown;
      try {
        const stacksResponse = await fetchFn(`${stacksPath}/v2/info`);
        stacksChainInfo = await stacksResponse?.json();
        if (!stacksChainInfo) throw new Error('Unable to fetch info from stacks node');
      } catch {
        setError('Unable to fetch info from stacks node');
        setLoading(false);
        return;
      }

      // Attention:
      // For mainnet/testnet the v2/info response `.network_id` refers to the chain ID
      // For subnets the v2/info response `.network_id` refers to the network ID and the chain ID (they are the same for subnets)
      // The `.parent_network_id` refers to the actual peer network ID in both cases
      const parsedChainInfo = stacksChainInfoSchema.safeParse(stacksChainInfo);
      const chainId = parsedChainInfo.data?.network_id;
      const parentNetworkId = parsedChainInfo.data?.parent_network_id;
      const subnetGoverningContract = parsedChainInfo.data?.l1_subnet_governing_contract;

      const isSubnet = isDefined(subnetGoverningContract);
      const isFirstLevelSubnet =
        isSubnet &&
        (parentNetworkId === PeerNetworkID.Mainnet || parentNetworkId === PeerNetworkID.Testnet);

      // Currently, only subnets of mainnet and testnet are supported in the wallet
      if (isFirstLevelSubnet) {
        const parentChainId =
          parentNetworkId === PeerNetworkID.Mainnet ? ChainId.Mainnet : ChainId.Testnet;
        saveNetwork({
          id: key,
          name,
          chainId: parentChainId, // Used for differentiating control flow in the wallet
          subnetChainId: chainId, // Used for signing transactions (via the network object, not to be confused with the NetworkConfigurations)
          url: stacksPath,
          bitcoinNetwork,
          mode: bitcoinNetworkToNetworkMode(bitcoinNetwork),
          bitcoinUrl: bitcoinPath,
        });
        return navigate(RouteUrls.Home);
      } else if (isDefined(chainId)) {
        saveNetwork({
          id: key,
          name,
          chainId,
          url: stacksPath,
          bitcoinNetwork,
          mode: bitcoinNetworkToNetworkMode(bitcoinNetwork),
          bitcoinUrl: bitcoinPath,
        });
        return navigate(RouteUrls.Home);
      } else {
        setError('Unable to determine chainID from node.');
      }
      setLoading(false);
    },
  };
}
