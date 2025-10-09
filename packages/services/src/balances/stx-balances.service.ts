import { inject, injectable } from 'inversify';
import { BehaviorSubject, Observable, combineLatest, map, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

import { stxAsset } from '@leather.io/constants';
import { StxBalance } from '@leather.io/models';
import {
  aggregateStxBalances,
  baseCurrencyAmountInQuote,
  createMoney,
  createStxBalance,
  hasStacksAddress,
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
import { AccountRequest } from '../types';
import { calculateInboundStxBalance, calculateOutboundStxBalance } from './stx-balances.utils';

export interface QuotedStxBalance {
  stx: StxBalance;
  quote: StxBalance;
}

export interface AddressQuotedStxBalance extends QuotedStxBalance {
  address?: string;
}

const stxAssetZeroBalance = createStxBalance(createMoney(0, 'STX'));

@injectable()
export class StxBalancesService {
  stxAccountBalances$ = new BehaviorSubject<QuotedStxBalance | null>(null);

  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly stacksApiClient: HiroStacksApiClient,
    private readonly marketDataService: MarketDataService,
    private readonly stacksTransactionsService: StacksTransactionsService
  ) {}

  /**
   * Gets cumulative STX balance of Stacks address list, denominated in both STX and quote currency.
   */
  public getStxAggregateBalance(
    requests: AccountRequest[],
    signal?: AbortSignal
  ): Observable<QuotedStxBalance> {
    return combineLatest(requests.map(request => this.getStxAccountBalance(request, signal))).pipe(
      map(addressBalances => {
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
      })
    );
  }
  /**
   * Gets STX balance of given account, denominated in both STX and quote currency.
   */
  public getStxAccountBalance(
    request: AccountRequest,
    signal?: AbortSignal
  ): Observable<AddressQuotedStxBalance> {
    if (!hasStacksAddress(request.account)) {
      return of({
        stx: stxAssetZeroBalance,
        quote: createStxBalance(createMoney(0, this.settingsService.getSettings().quoteCurrency)),
      });
    }
    return this.getStxAddressBalance(request.account.stacks.stxAddress, signal);
  }

  public getStxAddressBalance(address: string, signal?: AbortSignal) {
    const balance$ = fromPromise(
      Promise.all([
        this.stacksApiClient.getAddressStxBalance(address, { signal }),
        this.stacksTransactionsService.getPendingTransactions(address, signal),
        this.marketDataService.getMarketData(stxAsset, signal),
      ])
    );

    return balance$.pipe(
      map(([addressStxBalanceResponse, pendingTransactions, stxMarketData]) => {
        const totalBalanceStx = createMoney(readStxTotalBalance(addressStxBalanceResponse), 'STX');
        const lockedBalanceStx = createMoney(
          readStxLockedBalance(addressStxBalanceResponse),
          'STX'
        );
        const outboundBalanceStx = calculateOutboundStxBalance(address, pendingTransactions);
        const inboundBalanceStx = calculateInboundStxBalance(address, pendingTransactions);

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
      })
    );
  }

  public subscribe() {
    return [];
  }
}
