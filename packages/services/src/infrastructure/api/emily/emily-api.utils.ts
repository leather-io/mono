import {
  EMILY_API_BASE_URL_DEVENV,
  EMILY_API_BASE_URL_MAINNET,
  EMILY_API_BASE_URL_TESTNET,
  type NetworkConfiguration,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';

export function getEmilyApiUrl(network: NetworkConfiguration): string {
  if (network.id === WalletDefaultNetworkConfigurationIds.primaryStacksTestnet) {
    return EMILY_API_BASE_URL_TESTNET;
  }
  switch (network.chain.bitcoin.mode) {
    case 'mainnet':
      return EMILY_API_BASE_URL_MAINNET;
    case 'testnet':
    case 'signet':
      return EMILY_API_BASE_URL_TESTNET;
    case 'regtest':
      return EMILY_API_BASE_URL_DEVENV;
    default:
      throw new Error('Invalid network');
  }
}
