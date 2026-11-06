import { inject, injectable } from 'inversify';
import PQueue from 'p-queue';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import { NetworkModes } from '@leather.io/models';

import { Types } from '../../inversify.types';
import type { SettingsService } from '../settings/settings.service';
import { hiroStacksMainnetApiLimiter, hiroStacksTestnetApiLimiter } from './hiro-rate-limiter';
import { leatherApiLimiter } from './leather-rate-limiter';

// AbortController polyfill for React Native
if (!AbortSignal.prototype.throwIfAborted) {
  AbortSignal.prototype.throwIfAborted = function throwIfAborted() {
    if (this.aborted) {
      throwAbortError();
    }
  };
}

function throwAbortError(): never {
  const abortError = new Error('AbortError');
  abortError.name = 'AbortError';
  throw abortError;
}

export const RateLimiterType = {
  HiroStacks: 0,
  Leather: 1,
} as const;
export type RateLimiterType = (typeof RateLimiterType)[keyof typeof RateLimiterType];

export interface RateLimiterQueueOptions {
  interval: number;
  intervalCap: number;
  timeout: number;
}

interface RateLimiterCallOptions {
  priority?: number;
  throwOnTimeout?: boolean;
  signal?: AbortSignal;
}

@injectable()
export class RateLimiterService {
  private readonly limiters: Map<string, PQueue> = new Map([
    [this.getLimiterKey(RateLimiterType.HiroStacks, 'mainnet'), hiroStacksMainnetApiLimiter],
    [this.getLimiterKey(RateLimiterType.HiroStacks, 'testnet'), hiroStacksTestnetApiLimiter],
    [this.getLimiterKey(RateLimiterType.Leather, 'mainnet'), leatherApiLimiter],
    [this.getLimiterKey(RateLimiterType.Leather, 'testnet'), leatherApiLimiter],
  ]);

  constructor(@inject(Types.SettingsService) private readonly settingsService: SettingsService) {}

  public getLimiterKey(type: RateLimiterType, network: NetworkModes) {
    return `${type}_${network}`;
  }

  public getLimiter(type: RateLimiterType, mode: NetworkModes): PQueue {
    const key = this.getLimiterKey(type, mode);
    const limiter = this.limiters.get(key);
    if (!limiter) throw new Error(`No rate limiter configured for ${key}`);
    return limiter;
  }

  public async add<T>(
    type: RateLimiterType,
    fn: () => Promise<T>,
    options?: RateLimiterCallOptions
  ): Promise<T> {
    const limiter = this.getLimiter(
      type,
      bitcoinNetworkModeToCoreNetworkMode(
        this.settingsService.getSettings().network.chain.bitcoin.mode
      )
    );
    let result: T | void;
    try {
      result = await limiter.add(fn, options);
    } catch (error) {
      if (!error && options?.signal?.aborted) {
        throwAbortError();
      }
      throw error;
    }
    if (result !== undefined) return result;
    if (options?.signal?.aborted) {
      throwAbortError();
    }
    throw new Error('Rate limited call undefined');
  }
}
