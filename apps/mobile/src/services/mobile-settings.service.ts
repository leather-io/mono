import { store } from '@/store';
import { selectCurrencyPreference, selectNetworkPreference } from '@/store/settings/settings.read';

import { SettingsService } from '@leather.io/services';

export function createMobileSettingsService(): SettingsService {
  return {
    getSettings() {
      return {
        fiatCurrency: selectCurrencyPreference(store.getState()),
        network: selectNetworkPreference(store.getState()),
      };
    },
  };
}
