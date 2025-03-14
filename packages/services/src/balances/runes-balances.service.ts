import { inject, injectable } from 'inversify';

import { AccountAddresses, CryptoAssetBalance, RuneCryptoAssetInfo } from '@leather.io/models';
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
import { combineRunesBalances, readRunesOutputsBalances } from './runes-balances.utils';
import { sortByAvailableFiatBalance } from './sip10-balances.utils';

export interface RuneBalance {
  asset: RuneCryptoAssetInfo;
  fiat: CryptoAssetBalance;
  crypto: CryptoAssetBalance;
}

export interface RunesAggregateBalance {
  fiat: CryptoAssetBalance;
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
   * Gets combined Runes balances of provided Bitcoin accounts list. Includes cumulative fiat value.
   */
  public async getRunesAggregateBalance(
    accounts: AccountAddresses[],
    signal?: AbortSignal
  ): Promise<RunesAggregateBalance> {
    const accountBalances = await Promise.all(
      accounts.map(account => this.getRunesAccountBalance(account, signal))
    );

    const cumulativeFiatBalance =
      accountBalances.length > 0
        ? aggregateBaseCryptoAssetBalances(accountBalances.map(r => r.fiat))
        : createBaseCryptoAssetBalance(
            createMoney(0, this.settingsService.getSettings().fiatCurrency)
          );

    return {
      fiat: cumulativeFiatBalance,
      runes: combineRunesBalances(accountBalances).sort(sortByAvailableFiatBalance),
    };
  }

  /**
   * Gets all Rune balances for given account. Includes cumulative fiat value.
   */
  public async getRunesAccountBalance(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<RunesAccountBalance> {
    const runesOutputs = hasBitcoinAddress(account)
      ? await this.bisApiClient.fetchRunesValidOutputs(account.bitcoin.taprootDescriptor, signal)
      : [];
    const runesOutputsBalances = readRunesOutputsBalances(runesOutputs);
    const runesBalances = (
      await Promise.allSettled(
        Object.keys(runesOutputsBalances).map(runeName => {
          return this.getRuneBalance(runeName, runesOutputsBalances[runeName], signal);
        })
      )
    )
      .filter(result => result.status === 'fulfilled')
      .map(b => b.value);

    const cumulativeFiatBalance =
      runesBalances.length > 0
        ? aggregateBaseCryptoAssetBalances(runesBalances.map(b => b.fiat))
        : createBaseCryptoAssetBalance(
            createMoney(0, this.settingsService.getSettings().fiatCurrency)
          );

    return {
      account,
      fiat: cumulativeFiatBalance,
      runes: runesBalances.sort(sortByAvailableFiatBalance),
    };
  }

  public async getRuneBalance(
    runeName: string,
    amount: string,
    signal?: AbortSignal
  ): Promise<RuneBalance> {
    const runeInfo = await this.runeAssetService.getAssetInfo(runeName, signal);
    const totalBalance = createMoney(initBigNumber(amount), runeInfo.runeName, runeInfo.decimals);
    const runeMarketData = await this.marketDataService.getRuneMarketData(runeInfo, signal);
    return {
      asset: runeInfo,
      fiat: createBaseCryptoAssetBalance(baseCurrencyAmountInQuote(totalBalance, runeMarketData)),
      crypto: createBaseCryptoAssetBalance(totalBalance),
    };
  }
}
