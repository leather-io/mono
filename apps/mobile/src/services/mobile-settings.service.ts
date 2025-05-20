import { store } from '@/store';
import { selectCurrencyPreference, selectNetworkPreference } from '@/store/settings/settings.read';

import { SettingsService } from '@leather.io/services';

export class MobileSettingsService implements SettingsService {
  getSettings() {
    return {
      quoteCurrency: selectCurrencyPreference(store.getState()),
      network: selectNetworkPreference(store.getState()),
    };
  }
}
