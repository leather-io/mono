import { Sip10CryptoAssetInfo } from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import { Sip10TokensService } from '../assets/sip10-tokens.service';
import {
  getAssetNameFromIdentifier,
  getContractPrincipalFromAssetIdentifier,
} from '../assets/sip10-tokens.utils';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { MarketDataService } from '../market-data/market-data.service';
import { createSip10BalancesService } from './sip10-balances.service';

describe('Sip10BalancesService', () => {
  const mockStacksApiClient = {
    getAddressBalances: vi.fn().mockResolvedValue({
      fungible_tokens: {
        'SM123MOCK1.token-mock1::mock1': {
          balance: 12000000,
        },
        'SM123MOCK1.token-mock1::mock2': {
          balance: 20000000,
        },
      },
    }),
  } as unknown as HiroStacksApiClient;

  const mockMarketDataService = {
    getSip10MarketData: vi.fn().mockImplementation((asset: Sip10CryptoAssetInfo) => {
      if (asset.symbol === 'MOCK1') {
        return {
          pair: { base: asset.symbol, quote: 'USD' },
          price: { amount: initBigNumber(50.0), symbol: 'USD', decimals: 2 },
        };
      } else if (asset.symbol === 'MOCK2') {
        return {
          pair: { base: asset.symbol, quote: 'USD' },
          price: { amount: initBigNumber(100.0), symbol: 'USD', decimals: 2 },
        };
      } else {
        throw new Error('Unrecognized asset symbol');
      }
    }),
  } as unknown as MarketDataService;

  const mockSip10TokensService = {
    getInfo: vi.fn().mockImplementation(assetId =>
      Promise.resolve({
        decimals: 6,
        contractId: getContractPrincipalFromAssetIdentifier(assetId),
        symbol: getAssetNameFromIdentifier(assetId).toLocaleUpperCase(),
      })
    ),
  } as Sip10TokensService;

  const sip10BalancesService = createSip10BalancesService(
    mockStacksApiClient,
    mockMarketDataService,
    mockSip10TokensService
  );

  describe('getSip10AddressBalance', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('retrieves sip10 token balances using hiro stacks API, market data, and token info', async () => {
      const signal = new AbortController().signal;
      const stacksAddress = 'STACKS_ADDRESS';
      const balance = await sip10BalancesService.getSip10AddressBalance(stacksAddress, signal);
      expect(mockStacksApiClient.getAddressBalances).toHaveBeenCalledWith(stacksAddress, signal);
      expect(mockMarketDataService.getSip10MarketData).toHaveBeenCalledTimes(2);
      expect(mockSip10TokensService.getInfo).toHaveBeenCalledTimes(2);
      expect(balance.balances.length).toEqual(2);
    });

    it('calculates the sip10 and usd balances of each individual sip10 token for an address', async () => {
      const balance = await sip10BalancesService.getSip10AddressBalance('STACKS_ADDRESS');
      expect(balance.balances[0].sip10.totalBalance.amount).toEqual(initBigNumber(12000000));
      expect(balance.balances[0].sip10.availableBalance.amount).toEqual(initBigNumber(12000000));
      expect(balance.balances[1].sip10.totalBalance.amount).toEqual(initBigNumber(20000000));
      expect(balance.balances[1].sip10.availableBalance.amount).toEqual(initBigNumber(20000000));
      expect(balance.balances[0].usd.totalBalance.amount).toEqual(initBigNumber(600));
      expect(balance.balances[0].usd.availableBalance.amount).toEqual(initBigNumber(600));
      expect(balance.balances[1].usd.totalBalance.amount).toEqual(initBigNumber(2000));
      expect(balance.balances[1].usd.availableBalance.amount).toEqual(initBigNumber(2000));
    });

    it('sums the total usd balance of each sip10 token for an address', async () => {
      const balance = await sip10BalancesService.getSip10AddressBalance('STACKS_ADDRESS');
      expect(balance.usd.availableBalance.amount).toEqual(initBigNumber(2600));
    });
  });

  describe('getSip10AggregateBalance', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('retrieves sip10 balances for each address in the array', async () => {
      const aggregateBalance = await sip10BalancesService.getSip10AggregateBalance([
        'STACKS_ADDRESS1',
        'STACKS_ADDRESS2',
        'STACKS_ADDRESS3',
      ]);
      expect(mockStacksApiClient.getAddressBalances).toHaveBeenCalledTimes(3);
      expect(mockMarketDataService.getSip10MarketData).toHaveBeenCalledTimes(6);
      expect(mockSip10TokensService.getInfo).toHaveBeenCalledTimes(6);
      expect(aggregateBalance.balances.length).toEqual(3);
    });

    it('calculates the combined usd balance of all sip10 tokens of each address', async () => {
      const aggregateBalance = await sip10BalancesService.getSip10AggregateBalance([
        'STACKS_ADDRESS1',
        'STACKS_ADDRESS2',
        'STACKS_ADDRESS3',
      ]);
      expect(aggregateBalance.usd.totalBalance.amount).toEqual(initBigNumber(7800));
      expect(aggregateBalance.usd.availableBalance.amount).toEqual(initBigNumber(7800));
    });
  });
});
