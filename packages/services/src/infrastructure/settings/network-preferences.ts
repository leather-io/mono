import {
  NetworkConfiguration,
  WalletDefaultNetworkConfigurationIds,
  defaultNetworksKeyedById,
} from '@leather.io/models';

type NetworkPreferenceId = WalletDefaultNetworkConfigurationIds | 'mocknet';

interface ResolveNetworkPreferenceArgs {
  id: NetworkPreferenceId;
}

/**
 * Resolves a persisted or user-selected network identifier to the canonical
 * `NetworkConfiguration` used across clients. Mocknet preferences fall back to
 * the default testnet configuration to preserve the previous heuristic.
 */
export function resolveNetworkPreference({
  id,
}: ResolveNetworkPreferenceArgs): NetworkConfiguration {
  if (id === 'mocknet') {
    return defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.testnet];
  }
  return defaultNetworksKeyedById[id];
}

export function resolveNetworkPreferenceId(id: string): NetworkPreferenceId {
  if (id === 'mocknet') return 'mocknet';
  const values = Object.values(WalletDefaultNetworkConfigurationIds) as string[];
  if (values.includes(id)) {
    return id as WalletDefaultNetworkConfigurationIds;
  }
  throw new Error(`Unsupported network id: ${id}`);
}
