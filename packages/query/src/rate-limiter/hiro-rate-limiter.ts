import PQueue from 'p-queue';

import { HIRO_API_BASE_URL_TESTNET } from '@leather.io/models';

import { useCurrentNetworkState } from '../leather-query-provider';
import { PriorityQueue } from './queue-class';

const hiroStacksMainnetApiLimiter = new PQueue({
  interval: 1500,
  intervalCap: 3,
  timeout: 60000,
  queueClass: PriorityQueue,
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
