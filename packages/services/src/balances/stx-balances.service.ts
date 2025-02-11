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
import { SettingsService } from '../infrastructure/settings/settings.service';
import { MarketDataService } from '../market-data/market-data.service';
import { StacksTransactionsService } from '../transactions/stacks-transactions.service';
import { calculateInboundStxBalance, calculateOutboundStxBalance } from './stx-balances.utils';

export interface StxBalance {
  stx: StxCryptoAssetBalance;
  fiat: StxCryptoAssetBalance;
}

export interface StxAddressBalance extends StxBalance {
  address: string;
}

export interface StxBalancesService {
  getStxAggregateBalance(addresses: string[], signal?: AbortSignal): Promise<StxBalance>;
  getStxAddressBalance(address: string, signal?: AbortSignal): Promise<StxAddressBalance>;
}

const stxCryptoAssetZeroBalance = createStxCryptoAssetBalance(createMoney(0, 'STX'));

export function createStxBalancesService(
  settingsService: SettingsService,
  stacksApiClient: HiroStacksApiClient,
  marketDataService: MarketDataService,
  stacksTransactionsService: StacksTransactionsService
): StxBalancesService {
  /**
   * Gets cumulative STX balance of Stacks address list, denominated in both STX and fiat.
   */
  async function getStxAggregateBalance(addresses: string[], signal?: AbortSignal) {
    const addressBalances = await Promise.all(
      addresses.map(address => getStxAddressBalance(address, signal))
    );

    const cumulativeStxBalance =
      addressBalances.length > 0
        ? aggregateStxCryptoAssetBalances(addressBalances.map(r => r.stx))
        : stxCryptoAssetZeroBalance;

    const cumulativeFiatBalance =
      addressBalances.length > 0
        ? aggregateStxCryptoAssetBalances(addressBalances.map(r => r.fiat))
        : createStxCryptoAssetBalance(createMoney(0, settingsService.getSettings().fiatCurrency));

    return {
      stx: cumulativeStxBalance,
      fiat: cumulativeFiatBalance,
    };
  }

  /**
   * Gets STX balance of given address, denominated in both STX and Fiat.
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
      fiat: createStxCryptoAssetBalance(
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
