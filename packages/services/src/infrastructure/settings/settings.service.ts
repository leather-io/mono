import { Observable } from 'rxjs';

import { NetworkConfiguration, QuoteCurrency } from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

export interface UserSettings {
  network: NetworkConfiguration;
  quoteCurrency: QuoteCurrency;
  assetVisibility: Record<SerializedCryptoAssetId, boolean>;
}

export interface SettingsService {
  network$: Observable<NetworkConfiguration>;
  getSettings(): UserSettings;
}
