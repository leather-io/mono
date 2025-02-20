import {
  BITCOIN_API_BASE_URL_MAINNET,
  ChainId,
  HIRO_API_BASE_URL_MAINNET,
  NetworkConfiguration,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';
import { SettingsService } from '@leather.io/services';

const networkMainnet: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.mainnet,
  name: 'Mainnet',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainId.Mainnet,
      url: HIRO_API_BASE_URL_MAINNET,
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'mainnet',
      mode: 'mainnet',
      bitcoinUrl: BITCOIN_API_BASE_URL_MAINNET,
    },
  },
};

export function createMobileSettingsService(): SettingsService {
  return {
    getSettings() {
      return {
        fiatCurrency: 'USD',
        network: networkMainnet,
      };
    },
  };
}
