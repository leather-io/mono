import { getDefaultStore } from 'jotai';
import { quoteCurrencyAtom } from '~/store/quote-currency';
import { networkNameAtom } from '~/store/stacks-network';

import { defaultNetworksKeyedById } from '@leather.io/models';
import { SettingsService } from '@leather.io/services';

export class WebSettingsService implements SettingsService {
  getSettings() {
    const store = getDefaultStore();
    const quoteCurrency = store.get(quoteCurrencyAtom);
    const network = store.get(networkNameAtom);

    if (network === 'mocknet') {
      throw Error('Mocknet is not supported.');
    }

    return {
      quoteCurrency,
      network: defaultNetworksKeyedById[network],
    };
  }
}
