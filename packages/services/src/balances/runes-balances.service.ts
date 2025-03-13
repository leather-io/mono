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
import { SettingsService } from '../infrastructure/settings/settings.service';
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

export interface RunesBalancesService {
  getRunesAccountBalance(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<RunesAccountBalance>;
  getRunesAggregateBalance(
    accounts: AccountAddresses[],
    signal?: AbortSignal
  ): Promise<RunesAggregateBalance>;
}

export function createRunesBalancesService(
  settingsService: SettingsService,
  bisApiClient: BestInSlotApiClient,
  marketDataService: MarketDataService,
  runeAssetService: RuneAssetService
): RunesBalancesService {
  /**
   * Gets combined Runes balances of provided Bitcoin accounts list. Includes cumulative fiat value.
   */
  async function getRunesAggregateBalance(
    accounts: AccountAddresses[],
    signal?: AbortSignal
  ): Promise<RunesAggregateBalance> {
    const accountBalances = await Promise.all(
      accounts.map(account => getRunesAccountBalance(account, signal))
    );

    const cumulativeFiatBalance =
      accountBalances.length > 0
        ? aggregateBaseCryptoAssetBalances(accountBalances.map(r => r.fiat))
        : createBaseCryptoAssetBalance(createMoney(0, settingsService.getSettings().fiatCurrency));

    return {
      fiat: cumulativeFiatBalance,
      runes: combineRunesBalances(accountBalances).sort(sortByAvailableFiatBalance),
    };
  }

  /**
   * Gets all Rune balances for given account. Includes cumulative fiat value.
   */
  async function getRunesAccountBalance(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<RunesAccountBalance> {
    const runesOutputs = hasBitcoinAddress(account)
      ? await bisApiClient.fetchRunesValidOutputs(account.bitcoin.taprootDescriptor, signal)
      : [];
    const runesOutputsBalances = readRunesOutputsBalances(runesOutputs);
    const runesBalances = (
      await Promise.allSettled(
        Object.keys(runesOutputsBalances).map(runeName => {
          return getRuneBalance(runeName, runesOutputsBalances[runeName], signal);
        })
      )
    )
      .filter(result => result.status === 'fulfilled')
      .map(b => b.value);

    const cumulativeFiatBalance =
      runesBalances.length > 0
        ? aggregateBaseCryptoAssetBalances(runesBalances.map(b => b.fiat))
        : createBaseCryptoAssetBalance(createMoney(0, settingsService.getSettings().fiatCurrency));

    return {
      account,
      fiat: cumulativeFiatBalance,
      runes: runesBalances.sort(sortByAvailableFiatBalance),
    };
  }

  async function getRuneBalance(
    runeName: string,
    amount: string,
    signal?: AbortSignal
  ): Promise<RuneBalance> {
    const runeInfo = await runeAssetService.getAssetInfo(runeName, signal);
    const totalBalance = createMoney(initBigNumber(amount), runeInfo.runeName, runeInfo.decimals);
    const runeMarketData = await marketDataService.getRuneMarketData(runeInfo, signal);
    return {
      asset: runeInfo,
      fiat: createBaseCryptoAssetBalance(baseCurrencyAmountInQuote(totalBalance, runeMarketData)),
      crypto: createBaseCryptoAssetBalance(totalBalance),
    };
  }

  return {
    getRunesAccountBalance,
    getRunesAggregateBalance,
  };
}
