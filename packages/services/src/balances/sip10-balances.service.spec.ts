import { Sip10Asset } from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import { Sip10AssetService } from '../assets/sip10-asset.service';
import {
  getAssetNameFromIdentifier,
  getContractPrincipalFromAssetIdentifier,
} from '../assets/stacks-asset.utils';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { MarketDataService } from '../market-data/market-data.service';
import { AccountRequest } from '../types';
import { Sip10BalancesService } from './sip10-balances.service';

describe(Sip10BalancesService.name, () => {
  const mockStacksApiClient = {
    getAddressFtBalances: vi.fn().mockResolvedValue({
      results: [
        { token: 'SM123MOCK1.token-mock1::mock1', balance: 12000000 },
        { token: 'SM123MOCK1.token-mock1::mock2', balance: 20000000 },
      ],
    }),
  } as unknown as HiroStacksApiClient;

  const mockMarketDataService = {
    getMarketData: vi.fn().mockImplementation((asset: Sip10Asset) => {
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
    getAsset: vi.fn().mockImplementation(assetId =>
      Promise.resolve({
        decimals: 6,
        contractId: getContractPrincipalFromAssetIdentifier(assetId),
        symbol: getAssetNameFromIdentifier(assetId).toLocaleUpperCase(),
      })
    ),
  } as unknown as Sip10AssetService;

  const mockSettingsService = {
    getSettings: vi.fn().mockResolvedValue({
      quoteCurrency: 'USD',
    }),
  } as unknown as SettingsService;

  const sip10BalancesService = new Sip10BalancesService(
    mockSettingsService,
    mockStacksApiClient,
    mockMarketDataService,
    mockSip10TokensService
  );

  describe('getSip10AccountBalance', () => {
    const stacksAddress = 'STACKS_ADDRESS';
    const request = {
      account: {
        stacks: {
          stxAddress: stacksAddress,
        },
      },
    } as AccountRequest;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('retrieves sip10 token balances using hiro stacks API, market data, and token info', async () => {
      const signal = new AbortController().signal;
      const addressBalance = await sip10BalancesService.getSip10AccountBalance(request, signal);
      expect(mockStacksApiClient.getAddressFtBalances).toHaveBeenCalledWith(stacksAddress, {
        signal,
      });
      expect(mockMarketDataService.getMarketData).toHaveBeenCalledTimes(2);
      expect(mockSip10TokensService.getAsset).toHaveBeenCalledTimes(2);
      expect(addressBalance.sip10s.length).toEqual(2);
    });

    it('calculates the sip10 and usd balances of each individual sip10 token and sorts list by quote value', async () => {
      const balance = await sip10BalancesService.getSip10AccountBalance(request);
      expect(balance.sip10s[1].crypto.totalBalance.amount).toEqual(initBigNumber(12000000));
      expect(balance.sip10s[1].crypto.availableBalance.amount).toEqual(initBigNumber(12000000));
      expect(balance.sip10s[0].crypto.totalBalance.amount).toEqual(initBigNumber(20000000));
      expect(balance.sip10s[0].crypto.availableBalance.amount).toEqual(initBigNumber(20000000));
      expect(balance.sip10s[1].quote.totalBalance.amount).toEqual(initBigNumber(600));
      expect(balance.sip10s[1].quote.availableBalance.amount).toEqual(initBigNumber(600));
      expect(balance.sip10s[0].quote.totalBalance.amount).toEqual(initBigNumber(2000));
      expect(balance.sip10s[0].quote.availableBalance.amount).toEqual(initBigNumber(2000));
    });

    it('sums the total usd balance of each sip10 token for an address', async () => {
      const balance = await sip10BalancesService.getSip10AccountBalance({
        account: {
          stacks: {
            stxAddress: 'STACKS_ADDRESS',
          },
        },
      } as AccountRequest);
      expect(balance.quote.availableBalance.amount).toEqual(initBigNumber(2600));
    });

    it('returns an empty balance if the account has no stacks address', async () => {
      const balance = await sip10BalancesService.getSip10AccountBalance({
        account: {},
      } as AccountRequest);
      expect(balance.sip10s.length).toEqual(0);
      expect(balance.address).toBeUndefined();
      expect(balance.quote.availableBalance.amount).toEqual(initBigNumber(0));
    });
  });

  describe('getSip10AggregateBalance', () => {
    const stacksAddress1 = 'STACKS_ADDRESS1';
    const stacksAddress2 = 'STACKS_ADDRESS2';
    const stacksAddress3 = 'STACKS_ADDRESS3';
    const request1 = {
      account: {
        stacks: {
          stxAddress: stacksAddress1,
        },
      },
    } as AccountRequest;
    const request2 = {
      account: {
        stacks: {
          stxAddress: stacksAddress2,
        },
      },
    } as AccountRequest;
    const request3 = {
      account: {
        stacks: {
          stxAddress: stacksAddress3,
        },
      },
    } as AccountRequest;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('retrieves sip10 balances for each address in the array', async () => {
      const aggregateBalance = await sip10BalancesService.getSip10AggregateBalance([
        request1,
        request2,
        request3,
      ]);
      expect(mockStacksApiClient.getAddressFtBalances).toHaveBeenCalledTimes(3);
      expect(mockMarketDataService.getMarketData).toHaveBeenCalledTimes(6);
      expect(mockSip10TokensService.getAsset).toHaveBeenCalledTimes(6);
      expect(aggregateBalance.sip10s.length).toEqual(2);
    });

    it('calculates the combined usd balance of all sip10 tokens of each address', async () => {
      const aggregateBalance = await sip10BalancesService.getSip10AggregateBalance([
        request1,
        request2,
        request3,
      ]);
      expect(aggregateBalance.quote.totalBalance.amount).toEqual(initBigNumber(7800));
      expect(aggregateBalance.quote.availableBalance.amount).toEqual(initBigNumber(7800));
    });
  });
});
