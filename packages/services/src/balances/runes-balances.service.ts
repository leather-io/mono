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
import { MarketDataService } from '../market-data/market-data.service';
import { BitcoinAccountIdentifier } from '../shared/bitcoin.types';
import { baseCryptoAssetZeroBalanceUsd } from './constants';
import { aggregateRunesAccountBalances, readRunesOutputsBalances } from './runes-balances.utils';

export interface RuneAssetBalance {
  asset: RuneCryptoAssetInfo;
  usd: CryptoAssetBalance;
  crypto: CryptoAssetBalance;
}

export interface RunesAggregateBalance {
  usd: CryptoAssetBalance;
  runes: RuneAssetBalance[];
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
  bisApiClient: BestInSlotApiClient,
  marketDataService: MarketDataService,
  runeAssetService: RuneAssetService
): RunesBalancesService {
  /**
   * Retrieves cumulative Rune balance (denominated in USD) for provided Bitcoin accounts.
   * Includes full balance information for each individual account.
   */
  async function getRunesAggregateBalance(
    accounts: BitcoinAccountIdentifier[],
    signal?: AbortSignal
  ): Promise<RunesAggregateBalance> {
    const accountBalances = await Promise.all(
      accounts.map(account => getRunesAccountBalance(account, signal))
    );
    return {
      usd: aggregateBaseCryptoAssetBalances([
        baseCryptoAssetZeroBalanceUsd,
        ...accountBalances.map(b => b.usd),
      ]),
      runes: aggregateRunesAccountBalances(accountBalances),
    };
  }

  /**
   * Retrieve Rune balances for given account.
   * Includes cumulative USD-denominated balance.
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
    return {
      account,
      usd: aggregateBaseCryptoAssetBalances([
        baseCryptoAssetZeroBalanceUsd,
        ...runesBalances.map(b => b.usd),
      ]),
      runes: runesBalances,
    };
  }

  async function getRuneBalance(
    runeName: string,
    amount: string,
    signal?: AbortSignal
  ): Promise<RuneAssetBalance> {
    const runeInfo = await runeAssetService.getAssetInfo(runeName, signal);
    const totalBalance = createMoney(initBigNumber(amount), runeInfo.runeName, runeInfo.decimals);
    const runeMarketData = await marketDataService.getRuneMarketData(runeInfo, signal);
    return {
      asset: runeInfo,
      usd: createBaseCryptoAssetBalance(baseCurrencyAmountInQuote(totalBalance, runeMarketData)),
      crypto: createBaseCryptoAssetBalance(totalBalance),
    };
  }
  return {
    getRunesAccountBalance,
    getRunesAggregateBalance,
  };
}
