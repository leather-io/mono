import {
  BitflowSDK,
  QuoteResult,
  RouteQuote,
  type SelectedSwapRoute,
  SwapDataParamsAndPostConditions,
  SwapExecutionData,
  Token,
} from '@bitflowlabs/core-sdk';
import { inject, injectable } from 'inversify';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';
import type { Environment } from '../../environment';

export type BitflowSdkToken = Token;
export type BitflowSdkQuoteResult = QuoteResult;
export type BitflowSdkRouteQuote = RouteQuote;
export type BitflowSdkSelectedSwapRoute = SelectedSwapRoute;
export type BitflowSwapExecutionData = SwapExecutionData;
export type BitflowSwapParams = SwapDataParamsAndPostConditions;

@injectable()
export class BitflowSdkClient {
  private readonly bitflow: BitflowSDK | null;

  constructor(
    @inject(Types.Environment) env: Environment,
    @inject(Types.CacheService) private readonly cacheService: HttpCacheService
  ) {
    try {
      this.bitflow = new BitflowSDK({
        BITFLOW_API_HOST: env.bitflow?.bitflowApiHost,
        BITFLOW_API_KEY: env.bitflow?.bitflowApiKey,
        READONLY_CALL_API_HOST: env.bitflow?.readonlyCallApiHost,
        READONLY_CALL_API_KEY: env.bitflow?.readonlyCallApiKey,
        KEEPER_API_KEY: env.bitflow?.keeperApiKey,
        KEEPER_API_HOST: env.bitflow?.keeperApiHost,
        BITFLOW_PROVIDER_ADDRESS: env.bitflow?.bitflowProviderAddress,
      });
    } catch {
      this.bitflow = null;
    }
  }

  public async getAvailableTokens(): Promise<BitflowSdkToken[]> {
    if (!this.bitflow) return [];
    return await this.cacheService.fetchWithCache(
      ['bitflow-sdk-available-tokens'],
      async () => await this.bitflow!.getAvailableTokens()
    );
  }

  public async getAllPossibleTokenY(tokenXId: string): Promise<string[]> {
    if (!this.bitflow) return [];
    return await this.cacheService.fetchWithCache(
      ['bitflow-sdk-all-possible-token-y', tokenXId],
      async () => await this.bitflow!.getAllPossibleTokenY(tokenXId)
    );
  }

  public async getQuoteForRoute(
    tokenXId: string,
    tokenYId: string,
    amount: number
  ): Promise<BitflowSdkQuoteResult | null> {
    if (!this.bitflow) return null;
    return await this.cacheService.fetchWithCache(
      ['bitflow-sdk-get-quote-for-route', tokenXId, tokenYId, amount],
      async () => await this.bitflow!.getQuoteForRoute(tokenXId, tokenYId, amount)
    );
  }

  public async getSwapParams(
    swapExecutionData: SwapExecutionData,
    senderAddress: string,
    slippageTolerance?: number
  ) {
    if (!this.bitflow) return null;
    return await this.bitflow.getSwapParams(swapExecutionData, senderAddress, slippageTolerance);
  }
}
