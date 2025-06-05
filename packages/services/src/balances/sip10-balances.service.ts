import { inject, injectable } from 'inversify';

import { CryptoAssetBalance, Sip10CryptoAssetInfo } from '@leather.io/models';
import {
  aggregateBaseCryptoAssetBalances,
  baseCurrencyAmountInQuote,
  createBaseCryptoAssetBalance,
  createMoney,
} from '@leather.io/utils';

import { Sip10AssetService } from '../assets/sip10-asset.service';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { MarketDataService } from '../market-data/market-data.service';
import { combineSip10Balances, sortByAvailableQuoteBalance } from './sip10-balances.utils';

export interface Sip10Balance {
  asset: Sip10CryptoAssetInfo;
  quote: CryptoAssetBalance;
  crypto: CryptoAssetBalance;
}

export interface Sip10AggregateBalance {
  quote: CryptoAssetBalance;
  sip10s: Sip10Balance[];
}

export interface Sip10AddressBalance extends Sip10AggregateBalance {
  address: string;
}

@injectable()
export class Sip10BalancesService {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly stacksApiClient: HiroStacksApiClient,
    private readonly marketDataService: MarketDataService,
    private readonly sip10TokensService: Sip10AssetService
  ) {}

  /**
   * Gets combined SIP10 token balances of provided Stacks address list. Includes cumulative quote currency value.
   */
  public async getSip10AggregateBalance(
    addresses: string[],
    signal?: AbortSignal
  ): Promise<Sip10AggregateBalance> {
    const addressBalances = await Promise.all(
      addresses.map(address => this.getSip10AddressBalance(address, signal))
    );

    const cumulativeQuoteBalance =
      addressBalances.length > 0
        ? aggregateBaseCryptoAssetBalances(addressBalances.map(r => r.quote))
        : createBaseCryptoAssetBalance(
            createMoney(0, this.settingsService.getSettings().quoteCurrency)
          );

    return {
      quote: cumulativeQuoteBalance,
      sip10s: combineSip10Balances(addressBalances).sort(sortByAvailableQuoteBalance),
    };
  }

  /**
   * Gets all SIP10 balances for given address. Includes cumulative quote currency value.
   */
  public async getSip10AddressBalance(
    address: string,
    signal?: AbortSignal
  ): Promise<Sip10AddressBalance> {
    const ftBalances = (await this.stacksApiClient.getAddressFtBalances(address, signal)).results;

    const sip10Balances = (
      await Promise.allSettled(
        ftBalances
          .filter(ft => Number(ft.balance ?? 0) !== 0)
          .map(ft => this.getSip10TokenBalance(ft.token, Number(ft.balance ?? 0), signal))
      )
    )
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    const cumulativeQuoteBalance =
      sip10Balances.length > 0
        ? aggregateBaseCryptoAssetBalances(sip10Balances.map(b => b.quote))
        : createBaseCryptoAssetBalance(
            createMoney(0, this.settingsService.getSettings().quoteCurrency)
          );

    return {
      address,
      quote: cumulativeQuoteBalance,
      sip10s: sip10Balances.sort(sortByAvailableQuoteBalance),
    };
  }

  private async getSip10TokenBalance(
    tokenId: string,
    amount: number,
    signal?: AbortSignal
  ): Promise<Sip10Balance> {
    const asset = await this.sip10TokensService.getAssetInfo(tokenId, signal);
    const totalBalance = createMoney(amount, asset.symbol, asset.decimals);
    const marketData = await this.marketDataService.getMarketData(asset, signal);

    return {
      asset,
      quote: createBaseCryptoAssetBalance(baseCurrencyAmountInQuote(totalBalance, marketData)),
      crypto: createBaseCryptoAssetBalance(totalBalance),
    };
  }
}
