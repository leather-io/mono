import { store } from '@/store';
import {
  selectAssetVisibility,
  selectCurrencyPreference,
  selectNetworkPreference,
  selectTokenPreset,
} from '@/store/settings/settings.read';
import { getDefaultAssetVisibilityPolicy } from '@/store/settings/token-preset';

import { SettingsService } from '@leather.io/services';

export class MobileSettingsService implements SettingsService {
  getSettings() {
    return {
      quoteCurrency: selectCurrencyPreference(store.getState()),
      network: selectNetworkPreference(store.getState()),
      assetVisibility: selectAssetVisibility(store.getState()),
      defaultAssetVisibility: getDefaultAssetVisibilityPolicy(selectTokenPreset(store.getState())),
    };
  }
}
