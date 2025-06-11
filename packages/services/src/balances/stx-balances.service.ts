import { inject, injectable } from 'inversify';

import { stxAsset } from '@leather.io/constants';
import { StxBalance } from '@leather.io/models';
import {
  aggregateStxBalances,
  baseCurrencyAmountInQuote,
  createMoney,
  createStxBalance,
} from '@leather.io/utils';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  readStxLockedBalance,
  readStxTotalBalance,
} from '../infrastructure/api/hiro/hiro-stacks-api.utils';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { MarketDataService } from '../market-data/market-data.service';
import { StacksTransactionsService } from '../transactions/stacks-transactions.service';
import { calculateInboundStxBalance, calculateOutboundStxBalance } from './stx-balances.utils';

export interface QuotedStxBalance {
  stx: StxBalance;
  quote: StxBalance;
}

export interface AddressQuotedStxBalance extends QuotedStxBalance {
  address: string;
}

const stxAssetZeroBalance = createStxBalance(createMoney(0, 'STX'));

@injectable()
export class StxBalancesService {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly stacksApiClient: HiroStacksApiClient,
    private readonly marketDataService: MarketDataService,
    private readonly stacksTransactionsService: StacksTransactionsService
  ) {}

  /**
   * Gets cumulative STX balance of Stacks address list, denominated in both STX and quote currency.
   */
  public async getStxAggregateBalance(
    addresses: string[],
    signal?: AbortSignal
  ): Promise<QuotedStxBalance> {
    const addressBalances = await Promise.all(
      addresses.map(address => this.getStxAddressBalance(address, signal))
    );

    const cumulativeStxBalance =
      addressBalances.length > 0
        ? aggregateStxBalances(addressBalances.map(r => r.stx))
        : stxAssetZeroBalance;

    const cumulativeQuoteBalance =
      addressBalances.length > 0
        ? aggregateStxBalances(addressBalances.map(r => r.quote))
        : createStxBalance(createMoney(0, this.settingsService.getSettings().quoteCurrency));

    return {
      stx: cumulativeStxBalance,
      quote: cumulativeQuoteBalance,
    };
  }

  /**
   * Gets STX balance of given address, denominated in both STX and quote currency.
   */
  public async getStxAddressBalance(
    address: string,
    signal?: AbortSignal
  ): Promise<AddressQuotedStxBalance> {
    const [addressStxBalanceResponse, pendingTransactions, stxMarketData] = await Promise.all([
      this.stacksApiClient.getAddressStxBalance(address, signal),
      this.stacksTransactionsService.getPendingTransactions(address, signal),
      this.marketDataService.getMarketData(stxAsset, signal),
    ]);

    const totalBalanceStx = createMoney(readStxTotalBalance(addressStxBalanceResponse), 'STX');
    const lockedBalanceStx = createMoney(readStxLockedBalance(addressStxBalanceResponse), 'STX');
    const inboundBalanceStx = calculateInboundStxBalance(address, pendingTransactions);
    const outboundBalanceStx = calculateOutboundStxBalance(address, pendingTransactions);

    return {
      address,
      stx: createStxBalance(
        totalBalanceStx,
        inboundBalanceStx,
        outboundBalanceStx,
        lockedBalanceStx
      ),
      quote: createStxBalance(
        baseCurrencyAmountInQuote(totalBalanceStx, stxMarketData),
        baseCurrencyAmountInQuote(inboundBalanceStx, stxMarketData),
        baseCurrencyAmountInQuote(outboundBalanceStx, stxMarketData),
        baseCurrencyAmountInQuote(lockedBalanceStx, stxMarketData)
      ),
    };
  }
}
