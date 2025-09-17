import {
  BitcoinNetwork,
  HIRO_API_BASE_URL_MAINNET,
  defaultNetworksKeyedById,
} from '@leather.io/models';

import {
  selectAssetVisibility,
  selectBitcoinNetworkMode,
  selectStacksApiUrl,
} from './settings.selectors';
import { UserSettings } from './settings.service';

const userSettings: UserSettings = {
  quoteCurrency: 'USD',
  network: defaultNetworksKeyedById.mainnet,
  assetVisibility: {
    'some|asset': true,
  },
};

describe(selectBitcoinNetworkMode.name, () => {
  it('should select the network mode from settings', () => {
    const networkMode = selectBitcoinNetworkMode(userSettings);
    expect(networkMode).toEqual('mainnet' satisfies BitcoinNetwork);
  });
});

describe(selectStacksApiUrl.name, () => {
  it('should select the Hiro Stacks API url from settings', () => {
    const stacksApiUrl = selectStacksApiUrl(userSettings);
    expect(stacksApiUrl).toEqual(HIRO_API_BASE_URL_MAINNET);
  });
});

describe(selectAssetVisibility.name, () => {
  it('should select the asset visibility from settings', () => {
    const assetVisibility = selectAssetVisibility(userSettings);
    expect(assetVisibility).toEqual({
      'some|asset': true,
    });
  });
});
