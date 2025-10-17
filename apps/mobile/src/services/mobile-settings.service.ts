import { store } from '@/store';
import {
  selectAssetVisibility,
  selectCurrencyPreference,
  selectNetworkPreference,
} from '@/store/settings/settings.read';

import { buildUserSettings, resolveNetworkPreferenceId, SettingsService } from '@leather.io/services';

export class MobileSettingsService implements SettingsService {
  getSettings() {
    const state = store.getState();
    return buildUserSettings({
      quoteCurrency: selectCurrencyPreference(state),
      networkId: resolveNetworkPreferenceId(selectNetworkPreference(state).id),
      assetVisibility: selectAssetVisibility(state),
    });
  }
}
