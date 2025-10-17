import { getDefaultStore } from 'jotai';
import { quoteCurrencyAtom } from '~/store/quote-currency';
import { networkNameAtom } from '~/store/stacks-network';

import {
  SettingsService,
  buildUserSettings,
  resolveNetworkPreferenceId,
} from '@leather.io/services';

export class WebSettingsService implements SettingsService {
  getSettings() {
    const store = getDefaultStore();
    const quoteCurrency = store.get(quoteCurrencyAtom);
    const network = store.get(networkNameAtom);

    return buildUserSettings({
      quoteCurrency,
      networkId: resolveNetworkPreferenceId(network),
      assetVisibility: {},
    });
  }
}
