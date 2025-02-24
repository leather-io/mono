import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

import { NetworkModes } from '@leather.io/models';

import { debug } from './debug';

export function getNetwork(networkType: NetworkModes) {
  debug.log('Getting network for type:', networkType);

  if (networkType === 'mainnet') {
    const network = STACKS_MAINNET;
    debug.log('Created mainnet network:', {
      apiUrl: network.client.baseUrl,
    });
    return network;
  } else {
    const network = STACKS_TESTNET;
    debug.log('Created testnet network:', {
      apiUrl: network.client.baseUrl,
    });
    return network;
  }
}

export function getFallbackUrl(networkType?: NetworkModes): string {
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
