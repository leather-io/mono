import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import {
  type NetworkConfiguration,
  defaultCurrentNetwork,
  defaultNetworksKeyedById,
} from '@leather.io/models';

import { initialSearchParams } from '@app/common/initial-search-params';
import { RootState } from '@app/store';

import { useAppRequestedNetworkId } from './networks.hooks';
import { networksAdapter } from './networks.slice';
import { transformNetworkStateToMultichainStucture } from './networks.utils';

function selectNetworksSlice(state: RootState) {
  return state.networks;
}

const networksSelectors = networksAdapter.getSelectors<RootState>(selectNetworksSlice);

const selectNetworks = createSelector(
  networksSelectors.selectEntities,
  state =>
    ({
      ...defaultNetworksKeyedById,
      ...transformNetworkStateToMultichainStucture(state),
    }) as Record<string, NetworkConfiguration>
);

const selectCurrentNetworkId = createSelector(selectNetworksSlice, state => state.currentNetworkId);

export const selectAppRequestedNetworkId = createSelector(selectNetworks, networks => {
  // `network` param is a more generic network selector that doesn't deal with
  // custom networks
  const network = initialSearchParams.get('network');
  return network ? networks[network]?.id : undefined;
});

export const selectCurrentNetwork = createSelector(
  selectNetworks,
  selectCurrentNetworkId,
  selectAppRequestedNetworkId,
  (networks, currentNetworkId, appRequestedNetworkId) =>
    networks[appRequestedNetworkId || currentNetworkId] ?? defaultCurrentNetwork
);

export function useNetworks(): Record<string, NetworkConfiguration> {
  return useSelector(selectNetworks);
}

export function useCurrentNetworkId() {
  const requestNetworkId = useAppRequestedNetworkId();
  const currentNetworkId = useSelector(selectCurrentNetworkId);
  return requestNetworkId ?? currentNetworkId;
}

export function useCurrentNetwork(): NetworkConfiguration {
  return useSelector(selectCurrentNetwork);
}
