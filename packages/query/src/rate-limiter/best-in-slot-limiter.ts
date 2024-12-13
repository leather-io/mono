import PQueue from 'p-queue';

import { BESTINSLOT_API_BASE_URL_TESTNET } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { useCurrentNetworkState } from '../leather-query-provider';
import { PriorityQueue } from './queue-class';

const bestInSlotMainnetApiLimiter = new PQueue({
  interval: 1500,
  intervalCap: 10,
  timeout: 60000,
  queueClass: PriorityQueue,
});

const bestInSlotTestnetApiLimiter = new PQueue({
  interval: 1500,
  intervalCap: 10,
  timeout: 60000,
  queueClass: PriorityQueue,
});

export function useBestInSlotApiRateLimiter(): PQueue {
  const currentNetwork = useCurrentNetworkState();

  switch (currentNetwork.mode) {
    case 'mainnet':
      return bestInSlotMainnetApiLimiter;
    case 'testnet':
      return bestInSlotTestnetApiLimiter;
    default:
      assertUnreachable(currentNetwork.mode);
  }
}

export function getBestInSlotApiRateLimiter(url: string): PQueue {
  if (url.includes(BESTINSLOT_API_BASE_URL_TESTNET)) return bestInSlotTestnetApiLimiter;
  return bestInSlotMainnetApiLimiter;
}
