import { AlexSDK, Currency, TokenInfo } from 'alex-sdk';
import { TxToBroadCast } from 'alex-sdk/dist/helpers/SwapHelper';
import { AMMRoute } from 'alex-sdk/dist/utils/ammRouteResolver';
import { inject, injectable } from 'inversify';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';

export type AlexSdkTokenInfo = TokenInfo;
type AlexSdkCurrency = Currency;
export type AlexSdkLatestPrices = Partial<Record<AlexSdkCurrency, number>>;
type AlexSdkTxToBroadCast = TxToBroadCast;
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

  public async getLatestPrices(): Promise<AlexSdkLatestPrices> {
    return await this.alex.getLatestPrices();
  }

  private async toCurrency(value: string): Promise<AlexSdkCurrency> {
    const tokens = await this.alex.fetchSwappableCurrency();
    const token = tokens.find(({ id }) => id === value);
    if (!token) throw new Error(`Unknown ALEX currency: ${value}`);
    return token.id;
  }

  public async getRoute(from: string, to: string): Promise<AlexSdkAMMRoute> {
    return await this.alex.getRoute(await this.toCurrency(from), await this.toCurrency(to));
  }

  public async getFeeRate(from: string, to: string): Promise<bigint> {
    return await this.alex.getFeeRate(await this.toCurrency(from), await this.toCurrency(to));
  }

  public async getAmountTo(
    from: string,
    to: string,
    amount: bigint,
    route: AlexSdkAMMRoute
  ): Promise<bigint> {
    return await this.alex.getAmountTo(
      await this.toCurrency(from),
      amount,
      await this.toCurrency(to),
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
      await this.toCurrency(from),
      await this.toCurrency(to),
      fromAmount,
      minToAmount
    );
  }
}
