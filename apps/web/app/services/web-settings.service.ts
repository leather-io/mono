import { getDefaultStore } from 'jotai';
import { fiatCurrencyAtom } from '~/store/fiat-currency';
import { networkNameAtom } from '~/store/stacks-network';

import { defaultNetworksKeyedById } from '@leather.io/models';
import { SettingsService } from '@leather.io/services';

export class WebSettingsService implements SettingsService {
  getSettings() {
    const store = getDefaultStore();
    const fiatCurrency = store.get(fiatCurrencyAtom);
    const network = store.get(networkNameAtom);

    if (network === 'mocknet') {
      throw Error('Mocknet is not supported.');
    }

    return {
      fiatCurrency,
      network: defaultNetworksKeyedById[network],
    };
  }
}
