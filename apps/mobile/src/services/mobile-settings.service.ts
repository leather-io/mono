import {
  selectAssetVisibility,
  selectCurrencyPreference,
  selectNetworkPreference,
} from '@/store/settings/settings.read';
import { store } from '@/store/store';

import { type SettingsService } from '@leather.io/services';

export class MobileSettingsService implements SettingsService {
  getSettings() {
    return {
      quoteCurrency: selectCurrencyPreference(store.getState()),
      network: selectNetworkPreference(store.getState()),
      assetVisibility: selectAssetVisibility(store.getState()),
    };
  }
}
