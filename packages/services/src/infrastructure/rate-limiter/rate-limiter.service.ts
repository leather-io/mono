import { inject, injectable } from 'inversify';
import PQueue from 'p-queue';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import { NetworkModes } from '@leather.io/models';

import { Types } from '../../inversify.types';
import type { SettingsService } from '../settings/settings.service';
import { bestInSlotMainnetApiLimiter, bestInSlotTestnetApiLimiter } from './best-in-slot-limiter';
import { hiroStacksMainnetApiLimiter, hiroStacksTestnetApiLimiter } from './hiro-rate-limiter';
import { leatherApiLimiter } from './leather-rate-limiter';

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
  Leather,
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

@injectable()
export class RateLimiterService {
  private readonly limiters: Map<string, PQueue> = new Map([
    [this.getLimiterKey(RateLimiterType.BestInSlot, 'mainnet'), bestInSlotMainnetApiLimiter],
    [this.getLimiterKey(RateLimiterType.BestInSlot, 'testnet'), bestInSlotTestnetApiLimiter],
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
    return this.limiters.get(key)!;
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
    const result = await limiter.add(fn, options);
    if (result === undefined) {
      throw new Error('Rate limited call aborted');
    }
    return result;
  }
}
