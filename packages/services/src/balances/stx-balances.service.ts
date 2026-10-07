import { inject, injectable } from 'inversify';

import { stxAsset } from '@leather.io/constants';
import { Money, StxBalance } from '@leather.io/models';
import {
  aggregateStxBalances,
  baseCurrencyAmountInQuote,
  createMoney,
  createStxBalance,
  hasStacksAddress,
} from '@leather.io/utils';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { HiroAddressStxBalanceResponse } from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  readStxLockedBalance,
  readStxTotalBalance,
} from '../infrastructure/api/hiro/hiro-stacks-api.utils';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { MarketDataService } from '../market/market-data.service';
import { estimateBurnHeightDate } from '../staking/bitcoin-staking.utils';
import { StacksTransactionsService } from '../transactions/stacks-transactions.service';
import { AccountRequest } from '../types';
import { calculateInboundStxBalance, calculateOutboundStxBalance } from './stx-balances.utils';

export interface QuotedStxBalance {
  stx: StxBalance;
  quote: StxBalance;
}

export interface StxLockInfo {
  unlockBurnHeight: number;
  estimatedUnlockAt: Date;
}

export interface AddressQuotedStxBalance extends QuotedStxBalance {
  address?: string;
  lock?: StxLockInfo;
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
    requests: AccountRequest[],
    signal?: AbortSignal
  ): Promise<QuotedStxBalance> {
    const addressBalances = await Promise.all(
      requests.map(request => this.getStxAccountBalance(request, signal))
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
   * Gets STX balance of given account, denominated in both STX and quote currency.
   */
  public async getStxAccountBalance(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<AddressQuotedStxBalance> {
    if (!hasStacksAddress(request.account)) {
      return {
        stx: stxAssetZeroBalance,
        quote: createStxBalance(createMoney(0, this.settingsService.getSettings().quoteCurrency)),
      };
    }
    return this.getStxAddressBalance(request.account.stacks.stxAddress, signal);
  }

  public async getStxAddressBalance(
    address: string,
    signal?: AbortSignal
  ): Promise<AddressQuotedStxBalance> {
    const [addressStxBalanceResponse, pendingTransactions, stxMarketData] = await Promise.all([
      this.stacksApiClient.getAddressStxBalance(address, { signal }),
      this.stacksTransactionsService.getPendingTransactions(address, signal),
      this.marketDataService.getMarketData(stxAsset, signal),
    ]);

    const totalBalanceStx = createMoney(readStxTotalBalance(addressStxBalanceResponse), 'STX');
    const lockedBalanceStx = createMoney(readStxLockedBalance(addressStxBalanceResponse), 'STX');
    const inboundBalanceStx = calculateInboundStxBalance(address, pendingTransactions);
    const outboundBalanceStx = calculateOutboundStxBalance(address, pendingTransactions);
    const lock = await this.getStxLockInfo(addressStxBalanceResponse, lockedBalanceStx, signal);

    return {
      address,
      lock,
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

  private async getStxLockInfo(
    response: HiroAddressStxBalanceResponse,
    lockedBalance: Money,
    signal?: AbortSignal
  ): Promise<StxLockInfo | undefined> {
    if (!lockedBalance.amount.isGreaterThan(0) || !response.burnchain_unlock_height) {
      return undefined;
    }
    try {
      const poxInfo = await this.stacksApiClient.getPoxInfo({ signal });
      return {
        unlockBurnHeight: response.burnchain_unlock_height,
        estimatedUnlockAt: estimateBurnHeightDate(
          response.burnchain_unlock_height,
          poxInfo.current_burnchain_block_height,
          new Date()
        ),
      };
    } catch {
      return undefined;
    }
  }
}
