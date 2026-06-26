import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  ChainId,
  STACKS_MAINNET,
  STACKS_TESTNET,
  StacksNetwork,
  TransactionVersion,
} from '@stacks/network';

import {
  HIRO_API_BASE_URL_NAKAMOTO_TESTNET,
  bitcoinNetworkToNetworkMode,
} from '@leather.io/models';
import { whenStacksChainId } from '@leather.io/stacks';

import { useAppDispatch } from '@app/store';

import { networksActions, userEditsNetwork, userRemovesNetwork } from './networks.actions';
import { selectAppRequestedNetworkId, useCurrentNetwork } from './networks.selectors';
import type { PersistedNetworkConfiguration } from './networks.slice';

export function getStacksNetworkFromChainId(chainId: number) {
  if (chainId === ChainId.Mainnet) return STACKS_MAINNET;
  return STACKS_TESTNET;
}

export function useCurrentNetworkState() {
  const currentNetwork = useCurrentNetwork();

  return useMemo(() => {
    const isTestnet = currentNetwork.chain.stacks.chainId !== ChainId.Mainnet;
    const isNakamotoTestnet =
      currentNetwork.chain.stacks.url === HIRO_API_BASE_URL_NAKAMOTO_TESTNET;
    return { ...currentNetwork, isTestnet, isNakamotoTestnet };
  }, [currentNetwork]);
}

export function useCurrentStacksNetworkState(): StacksNetwork {
  const currentNetwork = useCurrentNetwork();

  return useMemo(
    () => ({
      ...getStacksNetworkFromChainId(currentNetwork.chain.stacks.chainId),
      transactionVersion: whenStacksChainId(currentNetwork.chain.stacks.chainId)({
        [ChainId.Mainnet]: TransactionVersion.Mainnet,
        [ChainId.Testnet]: TransactionVersion.Testnet,
      }),
      client: {
        baseUrl: currentNetwork.chain.stacks.url,
      },
      chainId: currentNetwork.chain.stacks.subnetChainId ?? currentNetwork.chain.stacks.chainId,
      bnsLookupUrl: currentNetwork.chain.stacks.url || '',
    }),
    [currentNetwork]
  );
}

function toNetworkActionPayload({
  id,
  name,
  chainId,
  subnetChainId,
  url,
  bitcoinNetwork,
  bitcoinUrl,
}: PersistedNetworkConfiguration): PersistedNetworkConfiguration {
  return {
    id,
    name,
    chainId,
    subnetChainId,
    url,
    bitcoinNetwork,
    mode: bitcoinNetworkToNetworkMode(bitcoinNetwork),
    bitcoinUrl,
  };
}

export function useNetworksActions() {
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      addNetwork(network: PersistedNetworkConfiguration) {
        const networkPayload = toNetworkActionPayload(network);
        dispatch(networksActions.addNetwork(networkPayload));
        dispatch(networksActions.changeNetwork(networkPayload.id));
        return;
      },
      editNetwork(currentId: string, network: PersistedNetworkConfiguration) {
        void dispatch(userEditsNetwork({ currentId, network: toNetworkActionPayload(network) }));
      },
      changeNetwork(id: string) {
        return dispatch(networksActions.changeNetwork(id));
      },
      removeNetwork(id: string) {
        void dispatch(userRemovesNetwork(id));
      },
    }),
    [dispatch]
  );
}

export function useAppRequestedNetworkId() {
  return useSelector(selectAppRequestedNetworkId);
}
