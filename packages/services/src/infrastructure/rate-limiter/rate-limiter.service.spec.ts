import { beforeEach, describe, expect, it } from 'vitest';

import { delay } from '@leather.io/utils';

import { UserSettings } from '../settings/settings.service';
import { bestInSlotApiLimiterSettings } from './best-in-slot-limiter';
import { RateLimiterService, RateLimiterType } from './rate-limiter.service';

describe('RateLimiterService', () => {
  const mockSettingsService = {
    getSettings: () =>
      ({
        quoteCurrency: 'USD',
        network: {
          chain: {
            bitcoin: {
              mode: 'mainnet',
            },
          },
        },
      }) as unknown as UserSettings,
  };

  beforeEach(async () => {
    await delay(100);
  });

  it('should rate limit concurrent calls', async () => {
    const service = new RateLimiterService(mockSettingsService);
    const startTime = Date.now();

    const callCount = bestInSlotApiLimiterSettings.intervalCap + 1;
    const promises = Array(callCount)
      .fill(null)
      .map(() => service.add(RateLimiterType.BestInSlot, () => Promise.resolve('result')));

    await Promise.all(promises);
    const duration = Date.now() - startTime;

    const expectedMinDuration = bestInSlotApiLimiterSettings.interval;
    expect(duration).toBeGreaterThanOrEqual(expectedMinDuration);
  });

  it('should handle priorities correctly', async () => {
    const service = new RateLimiterService(mockSettingsService);
    const results: number[] = [];
    const fillerCalls = Array(bestInSlotApiLimiterSettings.intervalCap)
      .fill(null)
      .map(() => service.add(RateLimiterType.BestInSlot, () => Promise.resolve('result')));
    const priorityPromises = [
      service.add(RateLimiterType.BestInSlot, () => Promise.resolve(results.push(3)), {
        priority: 3,
      }),
      service.add(RateLimiterType.BestInSlot, () => Promise.resolve(results.push(5)), {
        priority: 5,
      }),
      service.add(RateLimiterType.BestInSlot, () => Promise.resolve(results.push(1)), {
        priority: 1,
      }),
      service.add(RateLimiterType.BestInSlot, () => Promise.resolve(results.push(4)), {
        priority: 4,
      }),
      service.add(RateLimiterType.BestInSlot, () => Promise.resolve(results.push(2)), {
        priority: 2,
      }),
    ];

    await Promise.all([...fillerCalls, ...priorityPromises]);
    expect(results).toEqual([5, 4, 3, 2, 1]);
  });
});
