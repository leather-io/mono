import PQueue from 'p-queue';

import { PriorityQueue } from './priority-queue';
import { RateLimiterQueueOptions } from './rate-limiter.service';

export const bestInSlotApiLimiterSettings: RateLimiterQueueOptions = {
  interval: 1500,
  intervalCap: 10,
  timeout: 60000,
};

export const bestInSlotMainnetApiLimiter = new PQueue({
  ...bestInSlotApiLimiterSettings,
  queueClass: PriorityQueue,
});

export const bestInSlotTestnetApiLimiter = new PQueue({
  ...bestInSlotApiLimiterSettings,
  queueClass: PriorityQueue,
});
