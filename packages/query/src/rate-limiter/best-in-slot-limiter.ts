import PQueue from 'p-queue';

import { BESTINSLOT_API_BASE_URL_TESTNET } from '@leather.io/models';

import { PriorityQueue } from './queue-class';

export const bestInSlotMainnetApiLimiter = new PQueue({
  interval: 1500,
  intervalCap: 10,
  timeout: 60000,
  queueClass: PriorityQueue,
});

export const bestInSlotTestnetApiLimiter = new PQueue({
  interval: 1500,
  intervalCap: 10,
  timeout: 60000,
  queueClass: PriorityQueue,
});

export function getBestInSlotApiRateLimiter(url: string): PQueue {
  if (url.includes(BESTINSLOT_API_BASE_URL_TESTNET)) return bestInSlotTestnetApiLimiter;
  return bestInSlotMainnetApiLimiter;
}
