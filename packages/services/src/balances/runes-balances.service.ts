import { CryptoAssetBalance, RuneCryptoAssetInfo } from '@leather.io/models';
import {
  aggregateBaseCryptoAssetBalances,
  baseCurrencyAmountInQuote,
  createBaseCryptoAssetBalance,
  createMoney,
  initBigNumber,
} from '@leather.io/utils';

import { RuneAssetService } from '../assets/rune-asset.service';
import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { MarketDataService } from '../market-data/market-data.service';
import { BitcoinAccountIdentifier } from '../shared/bitcoin.types';
import { combineRunesBalances, readRunesOutputsBalances } from './runes-balances.utils';

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
  account: BitcoinAccountIdentifier;
}

export interface RunesBalancesService {
  getRunesAccountBalance(
    bitcoinAccount: BitcoinAccountIdentifier,
    signal?: AbortSignal
  ): Promise<RunesAccountBalance>;
  getRunesAggregateBalance(
    accounts: BitcoinAccountIdentifier[],
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
    accounts: BitcoinAccountIdentifier[],
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
      runes: combineRunesBalances(accountBalances),
    };
  }

  /**
   * Gets all Rune balances for given account. Includes cumulative fiat value.
   */
  async function getRunesAccountBalance(
    account: BitcoinAccountIdentifier,
    signal?: AbortSignal
  ): Promise<RunesAccountBalance> {
    const runesOutputs = await bisApiClient.fetchRunesValidOutputs(
      account.taprootDescriptor,
      signal
    );
    const runesOutputsBalances = readRunesOutputsBalances(runesOutputs);
    const runesBalances = await Promise.all(
      Object.keys(runesOutputsBalances).map(runeName => {
        return getRuneBalance(runeName, runesOutputsBalances[runeName], signal);
      })
    );

    const cumulativeFiatBalance =
      runesBalances.length > 0
        ? aggregateBaseCryptoAssetBalances(runesBalances.map(b => b.fiat))
        : createBaseCryptoAssetBalance(createMoney(0, settingsService.getSettings().fiatCurrency));

    return {
      account,
      fiat: cumulativeFiatBalance,
      runes: runesBalances,
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
