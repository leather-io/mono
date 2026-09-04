import BigNumber from 'bignumber.js';

import { stxAsset } from '@leather.io/constants';
import { SwapAsset, SwapProviderId, SwapQuote } from '@leather.io/models';
import { createMoney, getAssetId } from '@leather.io/utils';

import { FungibleAssetService } from '../assets/fungible-asset.service';
import { BtcBalancesService } from '../balances/btc-balances.service';
import { Sip10BalancesService } from '../balances/sip10-balances.service';
import { StxBalancesService } from '../balances/stx-balances.service';
import { AccountRequest } from '../types';
import { AlexSwapProviderService } from './alex-swap-provider.service';
import { BitflowBffApiSwapProviderService } from './bitflow-bff-api-swap-provider.service';
import { BitflowSdkSwapProviderService } from './bitflow-sdk-swap-provider.service';
import { SbtcBridgeSwapProviderService } from './sbtc-bridge-swap-provider.service';
import { SwapService } from './swap.service';
import { VelarSwapProviderService } from './velar-swap-provider.service';

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
    {} as unknown as StxBalancesService,
    {} as unknown as BtcBalancesService,
    {} as unknown as Sip10BalancesService,
    fungibleAssetService ?? ({} as unknown as FungibleAssetService),
    providers.velar as unknown as VelarSwapProviderService,
    providers.alex as unknown as AlexSwapProviderService,
    providers.bitflowSdk as unknown as BitflowSdkSwapProviderService,
    providers.bitflowBff as unknown as BitflowBffApiSwapProviderService,
    providers.sbtcBridge as unknown as SbtcBridgeSwapProviderService
  );
}

function createStubSwapAsset(symbol: string, providerIds: SwapProviderId[]): SwapAsset {
  return {
    asset: { protocol: 'nativeStx', symbol },
    providerAssets: providerIds.map(providerId => ({
      providerId,
      providerAssetId: `${providerId}-${symbol}`,
      assetId: `nativeStx-${symbol}`,
    })),
  } as unknown as SwapAsset;
}

function createStubSwapQuote(providerId: SwapProviderId, isExecutable = true): SwapQuote {
  return { providerId, isExecutable } as unknown as SwapQuote;
}

const stubAccountRequest = { account: {} } as unknown as AccountRequest;

describe(SwapService.name, () => {
  describe('getSwapQuotes', () => {
    const baseAsset = createStubSwapAsset('STX', ['velar-sdk', 'alex-sdk']);
    const targetAsset = createStubSwapAsset('USDA', ['velar-sdk', 'alex-sdk']);
    const oneStx = createMoney(1_000_000, 'STX');

    test('returns quotes from remaining providers when one provider rejects', async () => {
      const providers = createStubProviderServices();
      const velarQuote = createStubSwapQuote('velar-sdk');
      providers.velar.getSwapQuotes.mockResolvedValue([velarQuote]);
      providers.alex.getSwapQuotes.mockRejectedValue(new Error('provider down'));
      const swapService = createSwapService(providers);

      const quotes = await swapService.getSwapQuotes(baseAsset, targetAsset, oneStx);

      expect(quotes).toEqual([velarQuote]);
    });

    test('returns empty array when all matching providers reject', async () => {
      const providers = createStubProviderServices();
      providers.velar.getSwapQuotes.mockRejectedValue(new Error('provider down'));
      providers.alex.getSwapQuotes.mockRejectedValue(new Error('provider down'));
      const swapService = createSwapService(providers);

      const quotes = await swapService.getSwapQuotes(baseAsset, targetAsset, oneStx);

      expect(quotes).toEqual([]);
    });

    test('only queries providers present on both base and target assets', async () => {
      const providers = createStubProviderServices();
      const velarQuote = createStubSwapQuote('velar-sdk');
      providers.velar.getSwapQuotes.mockResolvedValue([velarQuote]);
      const velarOnlyTarget = createStubSwapAsset('USDA', ['velar-sdk']);
      const swapService = createSwapService(providers);

      const quotes = await swapService.getSwapQuotes(baseAsset, velarOnlyTarget, oneStx);

      expect(quotes).toEqual([velarQuote]);
      expect(providers.alex.getSwapQuotes).not.toHaveBeenCalled();
    });

    test('returns empty array without querying providers when base amount is zero', async () => {
      const providers = createStubProviderServices();
      const swapService = createSwapService(providers);

      const quotes = await swapService.getSwapQuotes(baseAsset, targetAsset, createMoney(0, 'STX'));

      expect(quotes).toEqual([]);
      expect(providers.velar.getSwapQuotes).not.toHaveBeenCalled();
      expect(providers.alex.getSwapQuotes).not.toHaveBeenCalled();
    });
  });

  describe('getBaseSwapAssets', () => {
    test('returns assets from remaining providers when one provider rejects', async () => {
      const providers = createStubProviderServices();
      providers.velar.getBaseProviderAssets.mockRejectedValue(new Error('provider down'));
      providers.alex.getBaseProviderAssets.mockResolvedValue([
        { providerId: 'alex-sdk', providerAssetId: 'alex-stx', assetId: getAssetId(stxAsset) },
      ]);
      const fungibleAssetService = {
        getVisibleAsset: vi.fn().mockResolvedValue(stxAsset),
      } as unknown as FungibleAssetService;
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
      const quote = createStubSwapQuote('velar-sdk', false);

      await expect(
        swapService.getSwapExecutionData(stubAccountRequest, quote, BigNumber(4))
      ).rejects.toThrowError('Quote is not executable');
    });

    test('throws when no provider service is registered for the quote provider', async () => {
      const providers = createStubProviderServices();
      providers.alex.providerId = 'velar-sdk';
      const swapService = createSwapService(providers);
      const quote = createStubSwapQuote('alex-sdk');

      await expect(
        swapService.getSwapExecutionData(stubAccountRequest, quote, BigNumber(4))
      ).rejects.toThrowError('No swap provider service registered for provider: alex-sdk');
    });
  });
});
