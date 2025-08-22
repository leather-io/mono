import { AlexSDK, Currency, TokenInfo } from 'alex-sdk';
import { TxToBroadCast } from 'alex-sdk/dist/helpers/SwapHelper';
import { AMMRoute } from 'alex-sdk/dist/utils/ammRouteResolver';
import { inject, injectable } from 'inversify';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';

export type AlexSdkTokenInfo = TokenInfo;
export type AlexSdkCurrency = Currency;
export type AlexSdkTxToBroadCast = TxToBroadCast;
export type AlexSdkAMMRoute = AMMRoute;

@injectable()
export class AlexSdkClient {
  private readonly alex: AlexSDK;

  constructor(@inject(Types.CacheService) private readonly cacheService: HttpCacheService) {
    this.alex = new AlexSDK();
  }

  public async fetchSwappableCurrency(): Promise<AlexSdkTokenInfo[]> {
    return await this.cacheService.fetchWithCache(
      ['alex-sdk-fetch-swappable-currency'],
      async () => await this.alex.fetchSwappableCurrency()
    );
  }

  public async getRoute(
    fromCurrency: AlexSdkCurrency,
    toCurrency: AlexSdkCurrency
  ): Promise<AlexSdkAMMRoute> {
    return await this.alex.getRoute(fromCurrency, toCurrency);
  }

  public async getFeeRate(
    fromCurrency: AlexSdkCurrency,
    toCurrency: AlexSdkCurrency
  ): Promise<bigint> {
    return await this.alex.getFeeRate(fromCurrency, toCurrency);
  }

  public async getAmountTo(
    from: AlexSdkCurrency,
    to: AlexSdkCurrency,
    amount: bigint
  ): Promise<bigint> {
    return await this.alex.getAmountTo(from, amount, to);
  }

  public async getSwapTx(
    stxAddress: string,
    fromCurrency: AlexSdkCurrency,
    toCurrency: AlexSdkCurrency,
    fromAmount: bigint,
    minToAmount: bigint
  ): Promise<AlexSdkTxToBroadCast> {
    return await this.alex.runSwap(stxAddress, fromCurrency, toCurrency, fromAmount, minToAmount);
  }
}
