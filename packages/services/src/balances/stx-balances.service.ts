import { StxCryptoAssetBalance } from '@leather.io/models';
import {
  aggregateStxCryptoAssetBalances,
  baseCurrencyAmountInQuote,
  createMoney,
  createStxCryptoAssetBalance,
} from '@leather.io/utils';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  readStxLockedBalance,
  readStxTotalBalance,
} from '../infrastructure/api/hiro/hiro-stacks-api.utils';
import { MarketDataService } from '../market-data/market-data.service';
import { StacksTransactionsService } from '../transactions/stacks-transactions.service';
import { calculateInboundStxBalance, calculateOutboundStxBalance } from './stx-balances.utils';

export interface StxAggregateBalance {
  stx: StxCryptoAssetBalance;
  usd: StxCryptoAssetBalance;
  balances: StxAddressBalance[];
}

export interface StxAddressBalance {
  address: string;
  stx: StxCryptoAssetBalance;
  usd: StxCryptoAssetBalance;
}

export interface StxBalancesService {
  getStxAggregateBalance(addresses: string[], signal?: AbortSignal): Promise<StxAggregateBalance>;
  getStxAddressBalance(address: string, signal?: AbortSignal): Promise<StxAddressBalance>;
}

export function createStxBalancesService(
  stacksApiClient: HiroStacksApiClient,
  marketDataService: MarketDataService,
  stacksTransactionsService: StacksTransactionsService
): StxBalancesService {
  /**
   * Gets cumulative STX balance (denominated in both STX and USD) for list of Stacks addresses.
   * Includes balance information for each individual address.
   */
  async function getStxAggregateBalance(addresses: string[], signal?: AbortSignal) {
    const addressBalances = await Promise.all(
      addresses.map(address => getStxAddressBalance(address, signal))
    );
    // console.log(new Date().toISOString(), 'STX addresses', addresses.length, addresses);
    return {
      stx: aggregateStxCryptoAssetBalances(addressBalances.map(res => res.stx)),
      usd: aggregateStxCryptoAssetBalances(addressBalances.map(res => res.usd)),
      balances: addressBalances,
    };
  }

  /**
   * Gets STX balance of given address (denominated in both STX and USD).
   */
  async function getStxAddressBalance(address: string, signal?: AbortSignal) {
    const [addressBalancesResponse, pendingTransactions, stxMarketData] = await Promise.all([
      stacksApiClient.getAddressBalances(address, signal),
      stacksTransactionsService.getPendingTransactions(address, signal),
      marketDataService.getStxMarketData(signal),
    ]);
    const totalBalanceStx = createMoney(readStxTotalBalance(addressBalancesResponse), 'STX');
    const lockedBalanceStx = createMoney(readStxLockedBalance(addressBalancesResponse), 'STX');
    const inboundBalanceStx = calculateInboundStxBalance(address, pendingTransactions);
    const outboundBalanceStx = calculateOutboundStxBalance(address, pendingTransactions);
    return {
      address,
      stx: createStxCryptoAssetBalance(
        totalBalanceStx,
        inboundBalanceStx,
        outboundBalanceStx,
        lockedBalanceStx
      ),
      usd: createStxCryptoAssetBalance(
        baseCurrencyAmountInQuote(totalBalanceStx, stxMarketData),
        baseCurrencyAmountInQuote(inboundBalanceStx, stxMarketData),
        baseCurrencyAmountInQuote(outboundBalanceStx, stxMarketData),
        baseCurrencyAmountInQuote(lockedBalanceStx, stxMarketData)
      ),
    };
  }

  return {
    getStxAddressBalance,
    getStxAggregateBalance,
  };
}
