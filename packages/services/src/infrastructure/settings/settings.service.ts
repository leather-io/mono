import { NetworkConfiguration, QuoteCurrency } from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

export type DefaultAssetVisibilityPolicy =
  | { type: 'appConfig' }
  | { type: 'allowlist'; assets: SerializedCryptoAssetId[] };

export interface UserSettings {
  network: NetworkConfiguration;
  quoteCurrency: QuoteCurrency;
  assetVisibility: Record<SerializedCryptoAssetId, boolean>;
  defaultAssetVisibility?: DefaultAssetVisibilityPolicy;
}

export interface SettingsService {
  getSettings(): UserSettings;
}
