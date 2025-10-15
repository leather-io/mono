import { Sip10Asset } from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import { Sip10AssetService } from '../assets/sip10-asset.service';
import {
  getAssetNameFromIdentifier,
  getContractPrincipalFromAssetIdentifier,
} from '../assets/stacks-asset.utils';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { MarketDataService } from '../market/market-data.service';
import { AccountRequest } from '../types';
import { Sip10BalancesService } from './sip10-balances.service';

describe(Sip10BalancesService.name, () => {
  const assetId1 = 'SM123MOCK.token-mock1::mock1';
  const assetId2 = 'SM123MOCK.token-mock2::mock2';
  const assetId1Balance = 12000000;
  const assetId2Balance = 20000000;

  const mockStacksApiClient = {
    getAddressFtBalances: vi.fn().mockResolvedValue({
      results: [
        { token: assetId1, balance: assetId1Balance },
        { token: assetId2, balance: assetId2Balance },
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

  const mockSip10AssetService = {
    getAsset: vi.fn().mockImplementation(assetId =>
      assetId.startsWith('SM123MOCK')
        ? Promise.resolve({
            decimals: 6,
            assetId,
            contractId: getContractPrincipalFromAssetIdentifier(assetId),
            symbol: getAssetNameFromIdentifier(assetId).toLocaleUpperCase(),
          })
        : Promise.reject(new Error())
    ),
  } as unknown as Sip10AssetService;

  const mockSettingsService = {
    getSettings: vi.fn().mockReturnValue({
      quoteCurrency: 'USD',
    }),
  } as unknown as SettingsService;

  const sip10BalancesService = new Sip10BalancesService(
    mockSettingsService,
    mockStacksApiClient,
    mockMarketDataService,
    mockSip10AssetService
  );

  describe('getSip10AggregateBalanceByAssetId', () => {
    const request1 = {
      account: {
        stacks: {
          stxAddress: 'STACKS_ADDRESS1',
        },
      },
      assets: {
        includeHiddenAssets: true,
      },
    } as AccountRequest;
    const request2 = {
      account: {
        stacks: {
          stxAddress: 'STACKS_ADDRESS2',
        },
      },
      assets: {
        includeHiddenAssets: true,
      },
    } as AccountRequest;
    const request3 = {
      account: {},
    } as AccountRequest;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should retrieve cumulative balance by assetId for given accounts', async () => {
      const balance = await sip10BalancesService.getSip10AggregateBalanceByAssetId(
        [request1, request2, request3],
        assetId1
      );
      expect(balance.asset.assetId).toEqual(assetId1);
      expect(balance.crypto.availableBalance.amount).toEqual(initBigNumber(assetId1Balance * 2));
    });
  });

  describe('getSip10BalanceByAssetId', () => {
    const request = {
      account: {
        stacks: {
          stxAddress: 'STACKS_ADDRESS',
        },
      },
      assets: {
        includeHiddenAssets: true,
      },
    } as AccountRequest;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should retrieve Sip10Balance for a given assetId', async () => {
      const balance = await sip10BalancesService.getSip10BalanceByAssetId(request, assetId1);
      expect(balance.asset.assetId).toEqual(assetId1);
      expect(balance.crypto.availableBalance.amount).toEqual(initBigNumber(assetId1Balance));
    });

    it('should return an empty balance of 0 if the assetId does not have a matching balance', async () => {
      const assetId3 = 'SM123MOCK.token-mock3::mock3';

      const balance = await sip10BalancesService.getSip10BalanceByAssetId(request, assetId3);
      expect(balance.asset.assetId).toEqual(assetId3);
      expect(balance.quote.availableBalance.amount).toEqual(initBigNumber(0));
      expect(balance.crypto.availableBalance.amount).toEqual(initBigNumber(0));
    });

    it('should throw an error if the assetId is not found', async () => {
      const invalidAssetId = 'INVALID_ASSET_ID';
      await expect(
        sip10BalancesService.getSip10BalanceByAssetId(request, invalidAssetId)
      ).rejects.toThrow();
    });
  });

  describe('getSip10AccountBalance', () => {
    const stacksAddress = 'STACKS_ADDRESS';
    const request = {
      account: {
        stacks: {
          stxAddress: stacksAddress,
        },
      },
      assets: {
        includeHiddenAssets: true,
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
      expect(mockSip10AssetService.getAsset).toHaveBeenCalledTimes(2);
      expect(addressBalance.sip10s.length).toEqual(2);
    });

    it('calculates the sip10 and usd balances of each individual sip10 token and sorts list by quote value', async () => {
      const balance = await sip10BalancesService.getSip10AccountBalance(request);
      expect(balance.sip10s[1].crypto.totalBalance.amount).toEqual(initBigNumber(assetId1Balance));
      expect(balance.sip10s[1].crypto.availableBalance.amount).toEqual(
        initBigNumber(assetId1Balance)
      );
      expect(balance.sip10s[0].crypto.totalBalance.amount).toEqual(initBigNumber(assetId2Balance));
      expect(balance.sip10s[0].crypto.availableBalance.amount).toEqual(
        initBigNumber(assetId2Balance)
      );
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
        assets: {
          includeHiddenAssets: true,
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
      assets: {
        includeHiddenAssets: true,
      },
    } as AccountRequest;
    const request2 = {
      account: {
        stacks: {
          stxAddress: stacksAddress2,
        },
      },
      assets: {
        includeHiddenAssets: true,
      },
    } as AccountRequest;
    const request3 = {
      account: {
        stacks: {
          stxAddress: stacksAddress3,
        },
      },
      assets: {
        includeHiddenAssets: true,
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
      expect(mockSip10AssetService.getAsset).toHaveBeenCalledTimes(6);
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
