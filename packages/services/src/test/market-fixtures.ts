import {
  type QuoteCurrency,
  type Sip10Asset,
  WalletDefaultNetworkConfigurationIds,
  defaultNetworksKeyedById,
} from '@leather.io/models';

import type { LeatherApiPriceMapEntry } from '../infrastructure/api/leather/leather-api.client';
import type { UserSettings } from '../infrastructure/settings/settings.service';

export function createMarketUserSettings(quoteCurrency: QuoteCurrency): UserSettings {
  return {
    quoteCurrency,
    network: defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.mainnet],
    assetVisibility: {},
  };
}

export function createMarketSip10Asset(overrides: Partial<Sip10Asset> = {}): Sip10Asset {
  return {
    chain: 'stacks',
    category: 'fungible',
    protocol: 'sip10',
    symbol: 'TOKEN',
    decimals: 6,
    hasMemo: true,
    name: 'Token',
    canTransfer: true,
    assetId: 'SP123.some-token::token',
    contractId: 'SP123.some-token',
    imageCanonicalUri: '',
    ...overrides,
  };
}

export function createMarketPriceMapEntry(
  overrides: Partial<LeatherApiPriceMapEntry> = {}
): LeatherApiPriceMapEntry {
  return {
    price: 0,
    lastPriceAt: '2026-01-01T00:00:00.000Z',
    change24h: null,
    ...overrides,
  };
}
