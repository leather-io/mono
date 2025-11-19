import { AlexSDK, Currency, TokenInfo } from 'alex-sdk';
import { TxToBroadCast } from 'alex-sdk/dist/helpers/SwapHelper';
import { AMMRoute } from 'alex-sdk/dist/utils/ammRouteResolver';
import { inject, injectable } from 'inversify';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';
import { stringToAlexSdkCurrency } from './alex-sdk.utils';

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

  public async getRoute(from: string, to: string): Promise<AlexSdkAMMRoute> {
    return await this.alex.getRoute(stringToAlexSdkCurrency(from), stringToAlexSdkCurrency(to));
  }

  public async getFeeRate(from: string, to: string): Promise<bigint> {
    return await this.alex.getFeeRate(stringToAlexSdkCurrency(from), stringToAlexSdkCurrency(to));
  }

  public async getAmountTo(
    from: string,
    to: string,
    amount: bigint,
    route: AlexSdkAMMRoute
  ): Promise<bigint> {
    return await this.alex.getAmountTo(
      stringToAlexSdkCurrency(from),
      amount,
      stringToAlexSdkCurrency(to),
      route
    );
  }

  public async getSwapTx(
    stxAddress: string,
    from: string,
    to: string,
    fromAmount: bigint,
    minToAmount: bigint
  ): Promise<AlexSdkTxToBroadCast> {
    return await this.alex.runSwap(
      stxAddress,
      stringToAlexSdkCurrency(from),
      stringToAlexSdkCurrency(to),
      fromAmount,
      minToAmount
    );
  }
}
