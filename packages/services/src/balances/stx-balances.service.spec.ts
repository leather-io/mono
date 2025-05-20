import { initBigNumber } from '@leather.io/utils';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { MarketDataService } from '../market-data/market-data.service';
import { StacksTransactionsService } from '../transactions/stacks-transactions.service';
import { StxBalancesService } from './stx-balances.service';

describe(StxBalancesService.name, () => {
  const stacksAddress = 'STACKS_ADDRESS';

  const mockSettingsService = {
    getSettings: vi.fn().mockResolvedValue({
      quoteCurrency: 'USD',
    }),
  } as unknown as SettingsService;

  const mockStacksApiClient = {
    getAddressBalances: vi.fn().mockResolvedValue({
      stx: { balance: '5000000', locked: '1000000' },
    }),
  } as unknown as HiroStacksApiClient;

  const mockMarketDataService = {
    getMarketData: vi.fn().mockResolvedValue({
      pair: { base: 'STX', quote: 'USD' },
      price: { amount: initBigNumber(100), symbol: 'USD', decimals: 2 },
    }),
  } as unknown as MarketDataService;

  const mockStacksTransactionsService = {
    getPendingTransactions: vi.fn().mockResolvedValue([
      {
        tx_type: 'token_transfer',
        token_transfer: {
          recipient_address: stacksAddress,
          amount: '1000000',
        },
      },
    ]),
  } as unknown as StacksTransactionsService;

  const stxBalancesService = new StxBalancesService(
    mockSettingsService,
    mockStacksApiClient,
    mockMarketDataService,
    mockStacksTransactionsService
  );

  describe('getStxAddressBalance', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('retrieves stx balance using stacks api account balance and pending transactions', async () => {
      const signal = new AbortController().signal;
      const balance = await stxBalancesService.getStxAddressBalance(stacksAddress, signal);
      expect(mockStacksApiClient.getAddressBalances).toHaveBeenCalledWith(stacksAddress, signal);
      expect(mockStacksTransactionsService.getPendingTransactions).toHaveBeenCalledWith(
        stacksAddress,
        signal
      );
      expect(balance.stx.totalBalance.amount).toEqual(initBigNumber(5000000));
      expect(balance.stx.lockedBalance.amount).toEqual(initBigNumber(1000000));
      expect(balance.stx.unlockedBalance.amount).toEqual(initBigNumber(4000000));
      expect(balance.stx.outboundBalance.amount).toEqual(initBigNumber(0));
      expect(balance.stx.inboundBalance.amount).toEqual(initBigNumber(1000000));
      expect(balance.stx.availableBalance.amount).toEqual(initBigNumber(5000000));
      expect(balance.stx.pendingBalance.amount).toEqual(initBigNumber(6000000));
      expect(balance.stx.availableUnlockedBalance.amount).toEqual(initBigNumber(4000000));
    });

    it('uses market data to calculate usd-denominated balances', async () => {
      const balance = await stxBalancesService.getStxAddressBalance(stacksAddress);
      expect(mockMarketDataService.getMarketData).toHaveBeenCalled();
      expect(balance.quote.totalBalance.amount).toEqual(initBigNumber(500));
      expect(balance.quote.lockedBalance.amount).toEqual(initBigNumber(100));
      expect(balance.quote.unlockedBalance.amount).toEqual(initBigNumber(400));
      expect(balance.quote.outboundBalance.amount).toEqual(initBigNumber(0));
      expect(balance.quote.inboundBalance.amount).toEqual(initBigNumber(100));
      expect(balance.quote.availableBalance.amount).toEqual(initBigNumber(500));
      expect(balance.quote.pendingBalance.amount).toEqual(initBigNumber(600));
      expect(balance.quote.availableUnlockedBalance.amount).toEqual(initBigNumber(400));
    });
  });

  describe('getStxAggregateBalance', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('sums address balances into aggregate stx and usd balances', async () => {
      const aggregateBalance = await stxBalancesService.getStxAggregateBalance([
        stacksAddress,
        stacksAddress,
        stacksAddress,
      ]);
      expect(aggregateBalance.stx.totalBalance.amount).toEqual(initBigNumber(5000000 * 3));
      expect(aggregateBalance.stx.lockedBalance.amount).toEqual(initBigNumber(1000000 * 3));
      expect(aggregateBalance.stx.unlockedBalance.amount).toEqual(initBigNumber(4000000 * 3));
      expect(aggregateBalance.stx.outboundBalance.amount).toEqual(initBigNumber(0));
      expect(aggregateBalance.stx.inboundBalance.amount).toEqual(initBigNumber(1000000 * 3));
      expect(aggregateBalance.stx.availableBalance.amount).toEqual(initBigNumber(5000000 * 3));
      expect(aggregateBalance.stx.pendingBalance.amount).toEqual(initBigNumber(6000000 * 3));
      expect(aggregateBalance.stx.availableUnlockedBalance.amount).toEqual(
        initBigNumber(4000000 * 3)
      );
      expect(aggregateBalance.quote.totalBalance.amount).toEqual(initBigNumber(500 * 3));
      expect(aggregateBalance.quote.lockedBalance.amount).toEqual(initBigNumber(100 * 3));
      expect(aggregateBalance.quote.unlockedBalance.amount).toEqual(initBigNumber(400 * 3));
      expect(aggregateBalance.quote.outboundBalance.amount).toEqual(initBigNumber(0));
      expect(aggregateBalance.quote.inboundBalance.amount).toEqual(initBigNumber(100 * 3));
      expect(aggregateBalance.quote.availableBalance.amount).toEqual(initBigNumber(500 * 3));
      expect(aggregateBalance.quote.pendingBalance.amount).toEqual(initBigNumber(600 * 3));
      expect(aggregateBalance.quote.availableUnlockedBalance.amount).toEqual(
        initBigNumber(400 * 3)
      );
    });
  });
});
