import { getDefaultStore } from 'jotai';
import { resolveNetworkConfiguration } from '~/features/multisig/network/resolve-network-configuration';
import { quoteCurrencyAtom } from '~/store/quote-currency';
import { networkNameAtom } from '~/store/stacks-network';

import { SettingsService } from '@leather.io/services';

export class WebSettingsService implements SettingsService {
  getSettings() {
    const store = getDefaultStore();
    const quoteCurrency = store.get(quoteCurrencyAtom);
    const network = store.get(networkNameAtom);

    if (network === 'mocknet') throw Error('Mocknet is not supported.');

    const networkConfiguration = resolveNetworkConfiguration(network);

    return {
      quoteCurrency,
      network: networkConfiguration,
      assetVisibility: {},
    };
  }
}
