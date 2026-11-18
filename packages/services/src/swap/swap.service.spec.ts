import BigNumber from 'bignumber.js';

import { stxAsset } from '@leather.io/constants';
import { type SwapAsset, type SwapProviderId, type SwapQuote } from '@leather.io/models';
import { createMoney, getAssetId } from '@leather.io/utils';

import { type FungibleAssetService } from '../assets/fungible-asset.service';
import { type BtcBalancesService } from '../balances/btc-balances.service';
import { type Sip10BalancesService } from '../balances/sip10-balances.service';
import { type StxBalancesService } from '../balances/stx-balances.service';
import { createMock } from '../test/create-mock';
import { createTestSip10Asset, createTestSwapQuote } from '../test/swap-fixtures';
import { type AccountRequest } from '../types';
import { type AlexSwapProviderService } from './alex-swap-provider.service';
import { type BitflowBffApiSwapProviderService } from './bitflow-bff-api-swap-provider.service';
import { type BitflowSdkSwapProviderService } from './bitflow-sdk-swap-provider.service';
import { type SbtcBridgeSwapProviderService } from './sbtc-bridge-swap-provider.service';
import { SwapService } from './swap.service';
import { type VelarSwapProviderService } from './velar-swap-provider.service';

function createStubProviderService(providerId: SwapProviderId) {
  return {
    providerId,
    getBaseProviderAssets: vi.fn().mockResolvedValue([]),
    getTargetProviderAssets: vi.fn().mockResolvedValue([]),
    getSwapQuotes: vi.fn().mockResolvedValue([]),
    getSwapExecutionData: vi.fn(),
  };
}

type StubProviderService = ReturnType<typeof createStubProviderService>;

interface StubProviderServices {
  velar: StubProviderService;
  alex: StubProviderService;
  bitflowSdk: StubProviderService;
  bitflowBff: StubProviderService;
  sbtcBridge: StubProviderService;
}

function createStubProviderServices(): StubProviderServices {
  return {
    velar: createStubProviderService('velar-sdk'),
    alex: createStubProviderService('alex-sdk'),
    bitflowSdk: createStubProviderService('bitflow-sdk'),
    bitflowBff: createStubProviderService('bitflow-bff-api'),
    sbtcBridge: createStubProviderService('sbtc-bridge'),
  };
}

interface CreateSwapServiceOverrides {
  fungibleAssetService?: FungibleAssetService;
}

function createSwapService(
  providers: StubProviderServices,
  { fungibleAssetService }: CreateSwapServiceOverrides = {}
) {
  return new SwapService(
    createMock<StxBalancesService>({}),
    createMock<BtcBalancesService>({}),
    createMock<Sip10BalancesService>({}),
    fungibleAssetService ?? createMock<FungibleAssetService>({}),
    createMock<VelarSwapProviderService>(providers.velar),
    createMock<AlexSwapProviderService>(providers.alex),
    createMock<BitflowSdkSwapProviderService>(providers.bitflowSdk),
    createMock<BitflowBffApiSwapProviderService>(providers.bitflowBff),
    createMock<SbtcBridgeSwapProviderService>(providers.sbtcBridge)
  );
}

function createStubSwapAsset(symbol: string, providerIds: SwapProviderId[]): SwapAsset {
  return {
    asset: createTestSip10Asset({ symbol }),
    providerAssets: providerIds.map(providerId => ({
      providerId,
      providerAssetId: `${providerId}-${symbol}`,
      assetId: { protocol: 'nativeStx', id: symbol },
    })),
  };
}

const stubAccountRequest: AccountRequest = {
  account: { id: { fingerprint: 'deadbeef', accountIndex: 0 } },
};

describe(SwapService.name, () => {
  describe('getSwapQuotes', () => {
    const baseAsset = createStubSwapAsset('STX', ['bitflow-sdk', 'alex-sdk']);
    const targetAsset = createStubSwapAsset('USDA', ['bitflow-sdk', 'alex-sdk']);
    const oneStx = createMoney(1_000_000, 'STX');

    test('returns quotes from remaining providers when one provider rejects', async () => {
      const providers = createStubProviderServices();
      const bitflowSdkQuote = createTestSwapQuote('bitflow-sdk');
      providers.bitflowSdk.getSwapQuotes.mockResolvedValue([bitflowSdkQuote]);
      providers.alex.getSwapQuotes.mockRejectedValue(new Error('provider down'));
      const swapService = createSwapService(providers);

      const quotes = await swapService.getSwapQuotes(baseAsset, targetAsset, oneStx);

      expect(quotes).toEqual([bitflowSdkQuote]);
    });

    test('returns empty array when all matching providers reject', async () => {
      const providers = createStubProviderServices();
      providers.bitflowSdk.getSwapQuotes.mockRejectedValue(new Error('provider down'));
      providers.alex.getSwapQuotes.mockRejectedValue(new Error('provider down'));
      const swapService = createSwapService(providers);

      const quotes = await swapService.getSwapQuotes(baseAsset, targetAsset, oneStx);

      expect(quotes).toEqual([]);
    });

    test('only queries providers present on both base and target assets', async () => {
      const providers = createStubProviderServices();
      const bitflowSdkQuote = createTestSwapQuote('bitflow-sdk');
      providers.bitflowSdk.getSwapQuotes.mockResolvedValue([bitflowSdkQuote]);
      const bitflowSdkOnlyTarget = createStubSwapAsset('USDA', ['bitflow-sdk']);
      const swapService = createSwapService(providers);

      const quotes = await swapService.getSwapQuotes(baseAsset, bitflowSdkOnlyTarget, oneStx);

      expect(quotes).toEqual([bitflowSdkQuote]);
      expect(providers.alex.getSwapQuotes).not.toHaveBeenCalled();
    });

    test('returns empty array without querying providers when base amount is zero', async () => {
      const providers = createStubProviderServices();
      const swapService = createSwapService(providers);

      const quotes = await swapService.getSwapQuotes(baseAsset, targetAsset, createMoney(0, 'STX'));

      expect(quotes).toEqual([]);
      expect(providers.bitflowSdk.getSwapQuotes).not.toHaveBeenCalled();
      expect(providers.alex.getSwapQuotes).not.toHaveBeenCalled();
    });
    test('drops a provider that never settles once the quote timeout elapses', async () => {
      vi.useFakeTimers();
      try {
        const providers = createStubProviderServices();
        const bitflowSdkQuote = createTestSwapQuote('bitflow-sdk');
        providers.bitflowSdk.getSwapQuotes.mockResolvedValue([bitflowSdkQuote]);
        providers.alex.getSwapQuotes.mockReturnValue(new Promise<SwapQuote[]>(() => undefined));
        const swapService = createSwapService(providers);

        const quotes = swapService.getSwapQuotes(baseAsset, targetAsset, oneStx);
        await vi.runAllTimersAsync();

        await expect(quotes).resolves.toEqual([bitflowSdkQuote]);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('getBaseSwapAssets', () => {
    test('returns assets from remaining providers when one provider rejects', async () => {
      const providers = createStubProviderServices();
      providers.bitflowSdk.getBaseProviderAssets.mockRejectedValue(new Error('provider down'));
      providers.alex.getBaseProviderAssets.mockResolvedValue([
        { providerId: 'alex-sdk', providerAssetId: 'alex-stx', assetId: getAssetId(stxAsset) },
      ]);
      const fungibleAssetService = createMock<FungibleAssetService>({
        getSwapAsset: vi.fn().mockResolvedValue(stxAsset),
      });
      const swapService = createSwapService(providers, { fungibleAssetService });

      const assets = await swapService.getBaseSwapAssets();

      expect(assets).toEqual([
        {
          asset: stxAsset,
          providerAssets: [expect.objectContaining({ providerId: 'alex-sdk' })],
        },
      ]);
    });
  });

  describe('getSwapExecutionData', () => {
    test('throws when quote is not executable', async () => {
      const swapService = createSwapService(createStubProviderServices());
      const quote = createTestSwapQuote('velar-sdk', false);

      await expect(
        swapService.getSwapExecutionData(stubAccountRequest, quote, BigNumber(4))
      ).rejects.toThrowError('Quote is not executable');
    });

    test('throws when no provider service is registered for the quote provider', async () => {
      const providers = createStubProviderServices();
      providers.alex.providerId = 'velar-sdk';
      const swapService = createSwapService(providers);
      const quote = createTestSwapQuote('alex-sdk');

      await expect(
        swapService.getSwapExecutionData(stubAccountRequest, quote, BigNumber(4))
      ).rejects.toThrowError('No swap provider service registered for provider: alex-sdk');
    });
  });
});
