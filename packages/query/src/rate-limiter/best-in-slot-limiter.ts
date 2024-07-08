import PQueue from 'p-queue';

import { BESTINSLOT_API_BASE_URL_TESTNET } from '@leather.io/models';

import { useCurrentNetworkState } from '../leather-query-provider';
import { PriorityQueue } from './queue-class';

const bestInSlotMainnetApiLimiter = new PQueue({
  interval: 1000,
  intervalCap: 4,
  timeout: 60000,
  queueClass: PriorityQueue,
});

const bestInSlotTestnetApiLimiter = new PQueue({
  concurrency: 20,
  interval: 60000,
  intervalCap: 20,
  timeout: 60000,
});

export function useBestInSlotApiRateLimiter(): PQueue {
  const currentNetwork = useCurrentNetworkState();

  switch (currentNetwork.mode) {
    case 'mainnet':
      return bestInSlotMainnetApiLimiter;
    case 'testnet':
      return bestInSlotTestnetApiLimiter;
  }
}

export function getBestInSlotApiRateLimiter(url: string): PQueue {
  if (url.includes(BESTINSLOT_API_BASE_URL_TESTNET)) return bestInSlotTestnetApiLimiter;
  return bestInSlotMainnetApiLimiter;
}