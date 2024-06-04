import PQueue from 'p-queue';

import { HIRO_API_BASE_URL_TESTNET } from '@leather-wallet/models';

import { useCurrentNetworkState } from './leather-query-provider';

const hiroStacksMainnetApiLimiter = new PQueue({
  interval: 60000,
  intervalCap: 100,
  timeout: 60000,
});

const hiroStacksTestnetApiLimiter = new PQueue({
  concurrency: 20,
  interval: 60000,
  intervalCap: 20,
  timeout: 60000,
});

export function useHiroApiRateLimiter(): PQueue {
  const currentNetwork = useCurrentNetworkState();

  switch (currentNetwork.mode) {
    case 'mainnet':
      return hiroStacksMainnetApiLimiter;
    case 'testnet':
      return hiroStacksTestnetApiLimiter;
  }
}

export function getHiroApiRateLimiter(url: string): PQueue {
  if (url.includes(HIRO_API_BASE_URL_TESTNET)) return hiroStacksTestnetApiLimiter;
  return hiroStacksMainnetApiLimiter;
}
