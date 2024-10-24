import { store } from '@/store';
import { selectNetworkPreference } from '@/store/settings/settings.read';

import { NetworkSettingsService } from '@leather.io/services';

export function createMobileNetworkSettingsService(): NetworkSettingsService {
  let currentNetworkId = selectNetworkPreference(store.getState()).id;
  store.subscribe(() => {
    // subscribes to redux network settings updates to ensure service is synced to store
    const nextNetworkId = selectNetworkPreference(store.getState()).id;
    if (currentNetworkId !== nextNetworkId) {
      currentNetworkId = nextNetworkId;
    }
  });
  return {
    getConfig() {
      return selectNetworkPreference(store.getState());
    },
  };
}
