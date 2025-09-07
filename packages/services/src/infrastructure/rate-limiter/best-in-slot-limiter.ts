import PQueue from 'p-queue';

import { RateLimiterQueueOptions } from './rate-limiter.service';

export const bestInSlotApiLimiterSettings: RateLimiterQueueOptions = {
  interval: 1500,
  intervalCap: 10,
  timeout: 60000,
};

export const bestInSlotMainnetApiLimiter: PQueue = new PQueue({
  ...bestInSlotApiLimiterSettings,
});

export const bestInSlotTestnetApiLimiter: PQueue = new PQueue({
  ...bestInSlotApiLimiterSettings,
});
