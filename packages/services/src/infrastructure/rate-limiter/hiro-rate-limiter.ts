import PQueue from 'p-queue';

import { PriorityQueue } from './priority-queue';
import { RateLimiterQueueOptions } from './rate-limiter.service';

export const hiroStacksApiLimiterSettings: RateLimiterQueueOptions = {
  interval: 1200,
  intervalCap: 6,
  timeout: 60000,
};

export const hiroStacksMainnetApiLimiter = new PQueue({
  ...hiroStacksApiLimiterSettings,
  queueClass: PriorityQueue,
});

export const hiroStacksTestnetApiLimiter = new PQueue({
  ...hiroStacksApiLimiterSettings,
  queueClass: PriorityQueue,
});
