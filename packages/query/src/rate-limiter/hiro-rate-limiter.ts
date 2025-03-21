import PQueue from 'p-queue';

import { HIRO_API_BASE_URL_TESTNET } from '@leather.io/models';

import { PriorityQueue } from './queue-class';

export const hiroStacksMainnetApiLimiter = new PQueue({
  interval: 1200,
  intervalCap: 6,
  timeout: 60000,
  queueClass: PriorityQueue,
});

export const hiroStacksTestnetApiLimiter = new PQueue({
  interval: 1200,
  intervalCap: 6,
  timeout: 60000,
  queueClass: PriorityQueue,
});

export function getHiroApiRateLimiter(url: string): PQueue {
  if (url.includes(HIRO_API_BASE_URL_TESTNET)) return hiroStacksTestnetApiLimiter;
  return hiroStacksMainnetApiLimiter;
}
