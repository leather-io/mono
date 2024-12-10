import { initBigNumber } from '@leather.io/utils';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { MarketDataService } from '../market-data/market-data.service';
import { StacksTransactionsService } from '../transactions/stacks-transactions.service';
import { createStxBalancesService } from './stx-balances.service';

describe('StxBalancesService', () => {
  const stacksAddress = 'STACKS_ADDRESS';

  const mockStacksApiClient = {
    getAddressBalances: vi.fn().mockResolvedValue({
      stx: { balance: '5000000', locked: '1000000' },
    }),
  } as unknown as HiroStacksApiClient;

  const mockMarketDataService = {
    getStxMarketData: vi.fn().mockResolvedValue({
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

  const stxBalancesService = createStxBalancesService(
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
      expect(mockMarketDataService.getStxMarketData).toHaveBeenCalled();
      expect(balance.usd.totalBalance.amount).toEqual(initBigNumber(500));
      expect(balance.usd.lockedBalance.amount).toEqual(initBigNumber(100));
      expect(balance.usd.unlockedBalance.amount).toEqual(initBigNumber(400));
      expect(balance.usd.outboundBalance.amount).toEqual(initBigNumber(0));
      expect(balance.usd.inboundBalance.amount).toEqual(initBigNumber(100));
      expect(balance.usd.availableBalance.amount).toEqual(initBigNumber(500));
      expect(balance.usd.pendingBalance.amount).toEqual(initBigNumber(600));
      expect(balance.usd.availableUnlockedBalance.amount).toEqual(initBigNumber(400));
    });
  });

  describe('getStxAggregateBalance', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('retrieves stx balances once for each address in array', async () => {
      const aggregateBalance = await stxBalancesService.getStxAggregateBalance([
        stacksAddress,
        stacksAddress,
        stacksAddress,
      ]);
      expect(mockStacksApiClient.getAddressBalances).toHaveBeenCalledTimes(3);
      expect(aggregateBalance.balances.length).toEqual(3);
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
      expect(aggregateBalance.usd.totalBalance.amount).toEqual(initBigNumber(500 * 3));
      expect(aggregateBalance.usd.lockedBalance.amount).toEqual(initBigNumber(100 * 3));
      expect(aggregateBalance.usd.unlockedBalance.amount).toEqual(initBigNumber(400 * 3));
      expect(aggregateBalance.usd.outboundBalance.amount).toEqual(initBigNumber(0));
      expect(aggregateBalance.usd.inboundBalance.amount).toEqual(initBigNumber(100 * 3));
      expect(aggregateBalance.usd.availableBalance.amount).toEqual(initBigNumber(500 * 3));
      expect(aggregateBalance.usd.pendingBalance.amount).toEqual(initBigNumber(600 * 3));
      expect(aggregateBalance.usd.availableUnlockedBalance.amount).toEqual(initBigNumber(400 * 3));
    });
  });
});
