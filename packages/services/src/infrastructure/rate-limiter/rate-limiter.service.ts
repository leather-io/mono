import PQueue from 'p-queue';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import { NetworkModes } from '@leather.io/models';

import { NetworkSettingsService } from '../settings/network-settings.service';
import { bestInSlotMainnetApiLimiter, bestInSlotTestnetApiLimiter } from './best-in-slot-limiter';
import { hiroStacksMainnetApiLimiter, hiroStacksTestnetApiLimiter } from './hiro-rate-limiter';

// AbortController polyfill for React Native
if (!AbortSignal.prototype.throwIfAborted) {
  AbortSignal.prototype.throwIfAborted = function throwIfAborted() {
    if (this.aborted) {
      throw new Error('AbortError');
    }
  };
}

export enum RateLimiterType {
  BestInSlot,
  HiroStacks,
}

export interface RateLimiterQueueOptions {
  interval: number;
  intervalCap: number;
  timeout: number;
}

export interface RateLimiterCallOptions {
  priority?: number;
  throwOnTimeout?: boolean;
  signal?: AbortSignal;
}

export interface RateLimiterService {
  add<T>(type: RateLimiterType, fn: () => Promise<T>, options?: RateLimiterCallOptions): Promise<T>;
}

export function createRateLimiterService(
  networkSettings: NetworkSettingsService
): RateLimiterService {
  const limiters = new Map<string, PQueue>([
    [getLimiterKey(RateLimiterType.BestInSlot, 'mainnet'), bestInSlotMainnetApiLimiter],
    [getLimiterKey(RateLimiterType.BestInSlot, 'testnet'), bestInSlotTestnetApiLimiter],
    [getLimiterKey(RateLimiterType.HiroStacks, 'mainnet'), hiroStacksMainnetApiLimiter],
    [getLimiterKey(RateLimiterType.HiroStacks, 'testnet'), hiroStacksTestnetApiLimiter],
  ]);

  function getLimiterKey(type: RateLimiterType, network: NetworkModes) {
    return `${type}_${network}`;
  }

  function getLimiter(type: RateLimiterType, mode: NetworkModes) {
    const key = getLimiterKey(type, mode);
    return limiters.get(key)!;
  }

  async function add<T>(
    type: RateLimiterType,
    fn: () => Promise<T>,
    options?: RateLimiterCallOptions
  ): Promise<T> {
    const limiter = getLimiter(
      type,
      bitcoinNetworkModeToCoreNetworkMode(networkSettings.getConfig().chain.bitcoin.mode)
    );
    const result = await limiter.add(fn, options);
    if (result === undefined) {
      throw new Error('Rate limited call aborted');
    }
    return result;
  }

  return {
    add,
  };
}
