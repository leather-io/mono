import { NetworkConfiguration, QuoteCurrency } from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

import { resolveNetworkPreference } from './network-preferences';

export interface UserSettings {
  network: NetworkConfiguration;
  quoteCurrency: QuoteCurrency;
  assetVisibility: Record<SerializedCryptoAssetId, boolean>;
}

export interface SettingsService {
  getSettings(): UserSettings;
}

export function buildUserSettings({
  networkId,
  quoteCurrency,
  assetVisibility,
}: {
  networkId: Parameters<typeof resolveNetworkPreference>[0]['id'];
  quoteCurrency: QuoteCurrency;
  assetVisibility: Record<SerializedCryptoAssetId, boolean>;
}): UserSettings {
  return {
    quoteCurrency,
    network: resolveNetworkPreference({ id: networkId }),
    assetVisibility,
  };
}
