import BigNumber from 'bignumber.js';

import { stxAsset } from '@leather.io/constants';
import { type Sip10Asset, type SwapProviderId, type SwapQuote } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

export function createTestSip10Asset(overrides: Partial<Sip10Asset> = {}): Sip10Asset {
  return {
    chain: 'stacks',
    category: 'fungible',
    protocol: 'sip10',
    name: 'Test Token',
    symbol: 'TEST',
    decimals: 6,
    hasMemo: true,
    canTransfer: true,
    assetId: 'SP000000000000000000002Q6VF78.test-token::test-token',
    contractId: 'SP000000000000000000002Q6VF78.test-token',
    imageCanonicalUri: '',
    ...overrides,
  };
}

export function createTestSwapQuote(providerId: SwapProviderId, isExecutable = true): SwapQuote {
  const base = {
    executionType: 'stacks-contract-call' as const,
    baseAsset: stxAsset,
    targetAsset: createTestSip10Asset(),
    baseAmount: createMoney(new BigNumber(1_000_000), 'STX', 6),
    targetAmount: createMoney(new BigNumber(1_000_000), 'TEST', 6),
    dexPath: [],
    assetPath: [],
    isExecutable,
    executionConstraints: [],
    createdAt: new Date(0),
  };
  if (providerId === 'alex-sdk') {
    return {
      ...base,
      providerId,
      providerQuoteData: {
        baseProviderAssetId: 'base',
        targetProviderAssetId: 'target',
        alexSdkAmmRoute: null,
      },
    };
  }
  if (providerId === 'velar-sdk') {
    return {
      ...base,
      providerId,
      providerQuoteData: { baseProviderAssetId: 'base', targetProviderAssetId: 'target' },
    };
  }
  if (providerId === 'bitflow-sdk') {
    return { ...base, providerId, providerQuoteData: { bitflowSdkSelectedSwapRoute: null } };
  }
  if (providerId === 'bitflow-bff-api') {
    return { ...base, providerId, providerQuoteData: { bitflowBffApiQuote: null } };
  }
  return { ...base, providerId, providerQuoteData: { signerSweepTxFeeSats: 0 } };
}
