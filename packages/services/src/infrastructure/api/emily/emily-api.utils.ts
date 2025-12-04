import {
  type BitcoinNetworkModes,
  EMILY_API_BASE_URL_DEVENV,
  EMILY_API_BASE_URL_MAINNET,
  EMILY_API_BASE_URL_TESTNET,
} from '@leather.io/models';

export function getEmilyApiUrl(mode: BitcoinNetworkModes): string {
  switch (mode) {
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
