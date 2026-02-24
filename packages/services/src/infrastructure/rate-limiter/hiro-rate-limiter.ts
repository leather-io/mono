import PQueue from 'p-queue';

import { RateLimiterQueueOptions } from './rate-limiter.service';

export const hiroStacksApiLimiterSettings: RateLimiterQueueOptions = {
  interval: 1000,
  intervalCap: 30,
  timeout: 60000,
};

export const hiroStacksMainnetApiLimiter: PQueue = new PQueue({
  ...hiroStacksApiLimiterSettings,
});

export const hiroStacksTestnetApiLimiter: PQueue = new PQueue({
  ...hiroStacksApiLimiterSettings,
});
