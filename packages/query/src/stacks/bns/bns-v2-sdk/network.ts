import { StacksMainnet, StacksTestnet } from '@stacks/network';

import { NetworkType } from './config';
import { debug } from './debug';

export function getNetwork(networkType: NetworkType) {
  debug.log('Getting network for type:', networkType);

  if (networkType === 'mainnet') {
    const network = new StacksMainnet();
    debug.log('Created mainnet network:', {
      apiUrl: network.coreApiUrl,
    });
    return network;
  } else {
    const network = new StacksTestnet();
    debug.log('Created testnet network:', {
      apiUrl: network.coreApiUrl,
    });
    return network;
  }
}

export function getFallbackUrl(networkType?: NetworkType): string {
  debug.log('Getting fallback URL for network type:', networkType);

  if (networkType === 'testnet') {
    const testnetFallbackUrl = process.env.NEXT_PUBLIC_BNS_FALLBACK_URL_TESTNET;
    debug.log('Testnet fallback URL:', testnetFallbackUrl);
    if (!testnetFallbackUrl) {
      debug.log('No testnet fallback URL configured');
      return '';
    }
    return testnetFallbackUrl;
  }

  const mainnetFallbackUrl = process.env.NEXT_PUBLIC_BNS_FALLBACK_URL;
  debug.log('Mainnet fallback URL:', mainnetFallbackUrl);
  if (!mainnetFallbackUrl) {
    debug.log('No mainnet fallback URL configured');
    return '';
  }
  return mainnetFallbackUrl;
}
