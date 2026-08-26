import { inject, injectable } from 'inversify';
import { isNonNull, isNullish } from 'remeda';

import { CryptoAssetBalance, Sip10Asset } from '@leather.io/models';
import {
  aggregateBaseCryptoAssetBalances,
  baseCurrencyAmountInQuote,
  createBaseCryptoAssetBalance,
  createMoney,
  hasStacksAddress,
} from '@leather.io/utils';

import { Sip10AssetService } from '../assets/sip10-asset.service';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { MarketDataService } from '../market/market-data.service';
import { AccountRequest } from '../types';
import { combineSip10Balances, sortByAvailableQuoteBalance } from './sip10-balances.utils';

export interface Sip10Balance {
  asset: Sip10Asset;
  quote: CryptoAssetBalance;
  crypto: CryptoAssetBalance;
}

export interface Sip10AggregateBalance {
  quote: CryptoAssetBalance;
  sip10s: Sip10Balance[];
}

export interface Sip10AddressBalance extends Sip10AggregateBalance {
  address?: string;
}

@injectable()
export class Sip10BalancesService {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly stacksApiClient: HiroStacksApiClient,
    private readonly marketDataService: MarketDataService,
    private readonly sip10AssetsService: Sip10AssetService
  ) {}

  /**
   * Gets combined SIP10 token balances of provided Stacks address list. Includes cumulative quote currency value.
   */
  public async getSip10AggregateBalance(
    requests: AccountRequest[],
    signal?: AbortSignal
  ): Promise<Sip10AggregateBalance> {
    const addressBalances = await Promise.all(
      requests.map(request => this.getSip10AccountBalance(request, signal))
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

  public async getSip10AggregateBalanceByAssetId(
    requests: AccountRequest[],
    assetId: string,
    signal?: AbortSignal
  ): Promise<Sip10Balance> {
    const accountSip10Balances = await Promise.all(
      requests.map(request => this.getSip10BalanceByAssetId(request, assetId, signal))
    );
    return {
      asset: accountSip10Balances[0].asset,
      quote: aggregateBaseCryptoAssetBalances(accountSip10Balances.map(r => r.quote)),
      crypto: aggregateBaseCryptoAssetBalances(accountSip10Balances.map(r => r.crypto)),
    };
  }

  public async getSip10BalanceByAssetId(
    request: AccountRequest,
    assetId: string,
    signal?: AbortSignal
  ): Promise<Sip10Balance> {
    const sip10Asset = await this.sip10AssetsService.getAsset(assetId, signal);
    const accountBalance = await this.getSip10AccountBalance(request, signal);
    const sip10Balance = accountBalance.sip10s.find(sip10 => sip10.asset.assetId === assetId);
    return {
      asset: sip10Asset,
      quote:
        sip10Balance?.quote ??
        createBaseCryptoAssetBalance(
          createMoney(0, this.settingsService.getSettings().quoteCurrency)
        ),
      crypto:
        sip10Balance?.crypto ??
        createBaseCryptoAssetBalance(createMoney(0, sip10Asset.symbol, sip10Asset.decimals)),
    };
  }

  public async getSip10BalanceByContractId(
    request: AccountRequest,
    contractId: string,
    signal?: AbortSignal
  ): Promise<Sip10Balance | null> {
    const accountBalance = await this.getSip10AccountBalance(request, signal);
    const sip10Balance = accountBalance.sip10s.find(sip10 => sip10.asset.contractId === contractId);
    if (!sip10Balance) {
      return null;
    }
    return {
      asset: sip10Balance.asset,
      quote:
        sip10Balance?.quote ??
        createBaseCryptoAssetBalance(
          createMoney(0, this.settingsService.getSettings().quoteCurrency)
        ),
      crypto:
        sip10Balance?.crypto ??
        createBaseCryptoAssetBalance(
          createMoney(0, sip10Balance.asset.symbol, sip10Balance.asset.decimals)
        ),
    };
  }

  public async getSip10AccountBalance(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<Sip10AddressBalance> {
    if (!hasStacksAddress(request.account)) {
      return {
        quote: createBaseCryptoAssetBalance(
          createMoney(0, this.settingsService.getSettings().quoteCurrency)
        ),
        sip10s: [],
      };
    }
    return this.getSip10AddressBalance(
      request.account.stacks.stxAddress,
      request.assets?.includeHiddenAssets,
      signal
    );
  }

  /**
   * Gets all SIP-10 balances for given Stacks address. Includes cumulative quote currency value.
   */
  public async getSip10AddressBalance(
    address: string,
    includeHiddenAssets = false,
    signal?: AbortSignal
  ): Promise<Sip10AddressBalance> {
    const ftBalances = (
      await this.stacksApiClient.getAddressFtBalances(address, {
        signal,
      })
    ).results;

    const sip10Balances = (
      await Promise.allSettled(
        ftBalances
          .filter(ft => Number(ft.balance ?? 0) !== 0)
          .map(ft =>
            this.createSip10Balance(ft.token, Number(ft.balance ?? 0), includeHiddenAssets, signal)
          )
      )
    )
      .map(result => (result.status === 'fulfilled' ? result.value : null))
      .filter(isNonNull);

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

  private async createSip10Balance(
    assetId: string,
    balanceAmount: number,
    includeHiddenAssets = false,
    signal?: AbortSignal
  ): Promise<Sip10Balance | null> {
    const asset = includeHiddenAssets
      ? await this.sip10AssetsService.getAsset(assetId, signal)
      : await this.sip10AssetsService.getVisibleAsset(assetId, signal);
    if (isNullish(asset)) {
      return null;
    }
    const totalBalance = createMoney(balanceAmount, asset.symbol, asset.decimals);
    const emptyQuote = createBaseCryptoAssetBalance(
      createMoney(0, this.settingsService.getSettings().quoteCurrency)
    );

    try {
      const marketData = await this.marketDataService.getMarketData(asset, signal);
      return {
        asset,
        quote: createBaseCryptoAssetBalance(baseCurrencyAmountInQuote(totalBalance, marketData)),
        crypto: createBaseCryptoAssetBalance(totalBalance),
      };
    } catch {
      return {
        asset,
        quote: emptyQuote,
        crypto: createBaseCryptoAssetBalance(totalBalance),
      };
    }
  }
}
