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
import { parseRunesOutputsBalances } from './runes-balances.utils';

export interface RuneAssetBalance {
  asset: RuneCryptoAssetInfo;
  usd: CryptoAssetBalance;
  rune: CryptoAssetBalance;
}

export interface RuneAccountBalance {
  account: BitcoinAccountIdentifier;
  usd: CryptoAssetBalance;
  runes: RuneAssetBalance[];
}

export interface RuneAggregateBalance {
  usd: CryptoAssetBalance;
  accountBalances: RuneAccountBalance[];
}

export interface RunesBalancesService {
  getRunesAccountBalance(
    bitcoinAccount: BitcoinAccountIdentifier,
    signal?: AbortSignal
  ): Promise<RuneAccountBalance>;
  getRunesAggregateBalance(
    accounts: BitcoinAccountIdentifier[],
    signal?: AbortSignal
  ): Promise<RuneAggregateBalance>;
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
  ) {
    const accountBalances = await Promise.all(
      accounts.map(account => getRunesAccountBalance(account, signal))
    );
    return {
      usd: aggregateBaseCryptoAssetBalances(accountBalances.map(b => b.usd)),
      accountBalances,
    };
  }

  /**
   * Retrieve Rune balances for given account.
   * Includes cumulative USD-denominated balance.
   */
  async function getRunesAccountBalance(account: BitcoinAccountIdentifier, signal?: AbortSignal) {
    const runesOutputs = await bisApiClient.fetchRunesValidOutputs(
      account.taprootDescriptor,
      signal
    );
    const runesOutputsBalances = parseRunesOutputsBalances(runesOutputs);
    const balances = await Promise.all(
      Object.keys(runesOutputsBalances).map(runeName => {
        return getRuneBalance(runeName, runesOutputsBalances[runeName], signal);
      })
    );
    return {
      account,
      usd: aggregateBaseCryptoAssetBalances(balances.map(b => b.usd)),
      runes: balances,
    };
  }

  async function getRuneBalance(
    runeName: string,
    amount: string,
    signal?: AbortSignal
  ): Promise<RuneAssetBalance> {
    const runeInfo = await runeAssetService.getAssetInfo(runeName, signal);
    const totalBalance = createMoney(initBigNumber(amount), runeInfo.symbol, runeInfo.decimals);
    const runeMarketData = await marketDataService.getRuneMarketData(runeInfo, signal);
    return {
      asset: runeInfo,
      rune: createBaseCryptoAssetBalance(totalBalance),
      usd: createBaseCryptoAssetBalance(baseCurrencyAmountInQuote(totalBalance, runeMarketData)),
    };
  }
  return {
    getRunesAccountBalance,
    getRunesAggregateBalance,
  };
}
