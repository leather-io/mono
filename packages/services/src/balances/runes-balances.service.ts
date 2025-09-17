import { inject, injectable } from 'inversify';
import { isNonNull, isNullish } from 'remeda';

import { AccountAddresses, CryptoAssetBalance, RuneAsset } from '@leather.io/models';
import {
  aggregateBaseCryptoAssetBalances,
  baseCurrencyAmountInQuote,
  createBaseCryptoAssetBalance,
  createMoney,
  hasBitcoinAddress,
  initBigNumber,
} from '@leather.io/utils';

import { RuneAssetService } from '../assets/rune-asset.service';
import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { MarketDataService } from '../market-data/market-data.service';
import { AccountRequest } from '../types';
import { combineRunesBalances, readRunesOutputsBalances } from './runes-balances.utils';
import { sortByAvailableQuoteBalance } from './sip10-balances.utils';

export interface RuneBalance {
  asset: RuneAsset;
  quote: CryptoAssetBalance;
  crypto: CryptoAssetBalance;
}

export interface RunesAggregateBalance {
  quote: CryptoAssetBalance;
  runes: RuneBalance[];
}

export interface RunesAccountBalance extends RunesAggregateBalance {
  account: AccountAddresses;
}

@injectable()
export class RunesBalancesService {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly bisApiClient: BestInSlotApiClient,
    private readonly marketDataService: MarketDataService,
    private readonly runeAssetService: RuneAssetService
  ) {}
  /**
   * Gets combined Runes balances of provided Bitcoin accounts list. Includes cumulative quote currency value.
   */
  public async getRunesAggregateBalance(
    requests: AccountRequest[],
    signal?: AbortSignal
  ): Promise<RunesAggregateBalance> {
    const accountBalances = await Promise.all(
      requests.map(request => this.getRunesAccountBalance(request, signal))
    );

    const cumulativeQuoteBalance =
      accountBalances.length > 0
        ? aggregateBaseCryptoAssetBalances(accountBalances.map(r => r.quote))
        : createBaseCryptoAssetBalance(
            createMoney(0, this.settingsService.getSettings().quoteCurrency)
          );

    return {
      quote: cumulativeQuoteBalance,
      runes: combineRunesBalances(accountBalances).sort(sortByAvailableQuoteBalance),
    };
  }

  public async getRuneAggregateBalanceByRuneName(
    requests: AccountRequest[],
    runeName: string,
    signal?: AbortSignal
  ): Promise<RuneBalance> {
    const accountRuneBalances = await Promise.all(
      requests.map(request => this.getRuneBalanceByRuneName(request, runeName, signal))
    );
    return {
      asset: accountRuneBalances[0].asset,
      quote: aggregateBaseCryptoAssetBalances(accountRuneBalances.map(r => r.quote)),
      crypto: aggregateBaseCryptoAssetBalances(accountRuneBalances.map(r => r.crypto)),
    };
  }

  public async getRuneBalanceByRuneName(
    request: AccountRequest,
    runeName: string,
    signal?: AbortSignal
  ): Promise<RuneBalance> {
    const runeAsset = await this.runeAssetService.getAsset(runeName, signal);
    const accountBalance = await this.getRunesAccountBalance(request, signal);
    const runeBalance = accountBalance.runes.find(rune => rune.asset.runeName === runeName);
    return {
      asset: runeAsset,
      quote:
        runeBalance?.quote ??
        createBaseCryptoAssetBalance(
          createMoney(0, this.settingsService.getSettings().quoteCurrency)
        ),
      crypto:
        runeBalance?.crypto ??
        createBaseCryptoAssetBalance(createMoney(0, runeAsset.runeName, runeAsset.decimals)),
    };
  }

  /**
   * Gets all Rune balances for given account. Includes cumulative quote currency value.
   */
  public async getRunesAccountBalance(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<RunesAccountBalance> {
    const runesOutputs = [];
    if (hasBitcoinAddress(request.account)) {
      const [taprootRunesOutputs, nativeSegwitRunesOutputs] = await Promise.all([
        this.bisApiClient.fetchRunesValidOutputs(request.account.bitcoin.taprootDescriptor, {
          signal,
        }),
        this.bisApiClient.fetchRunesValidOutputs(request.account.bitcoin.nativeSegwitDescriptor, {
          signal,
        }),
      ]);
      runesOutputs.push(...nativeSegwitRunesOutputs, ...taprootRunesOutputs);
    }
    const runesOutputsBalances = readRunesOutputsBalances(runesOutputs);

    const runesBalances = (
      await Promise.allSettled(
        Object.keys(runesOutputsBalances).map(runeName => {
          return this.createRuneBalance(
            runeName,
            runesOutputsBalances[runeName],
            request.assets?.includeHiddenAssets,
            signal
          );
        })
      )
    )
      .map(result => (result.status === 'fulfilled' ? result.value : null))
      .filter(isNonNull);

    const cumulativeQuoteBalance =
      runesBalances.length > 0
        ? aggregateBaseCryptoAssetBalances(runesBalances.map(b => b.quote))
        : createBaseCryptoAssetBalance(
            createMoney(0, this.settingsService.getSettings().quoteCurrency)
          );

    return {
      account: request.account,
      quote: cumulativeQuoteBalance,
      runes: runesBalances.sort(sortByAvailableQuoteBalance),
    };
  }

  public async createRuneBalance(
    runeName: string,
    balanceAmount: string,
    includeHiddenAssets = false,
    signal?: AbortSignal
  ): Promise<RuneBalance | null> {
    const asset = includeHiddenAssets
      ? await this.runeAssetService.getAsset(runeName, signal)
      : await this.runeAssetService.getVisibleAsset(runeName, signal);
    if (isNullish(asset)) {
      return null;
    }
    const runeMarketData = await this.marketDataService.getMarketData(asset, signal);
    const totalBalance = createMoney(initBigNumber(balanceAmount), asset.runeName, asset.decimals);
    return {
      asset,
      quote: createBaseCryptoAssetBalance(baseCurrencyAmountInQuote(totalBalance, runeMarketData)),
      crypto: createBaseCryptoAssetBalance(totalBalance),
    };
  }
}
