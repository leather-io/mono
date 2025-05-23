import { z } from 'zod';
import { ProviderId, StackingProviderId, stackingPoolData } from '~/data/data';

export type NetworkMode = 'mainnet' | 'testnet' | 'devnet';

export type PoolSlug = keyof typeof poolSlugToIdMap;

export const poolSlugToIdMap = {
  'fast-pool': 'fastPool',
  'fast-pool-v2': 'fastPoolV2',
  planbetter: 'planbetter',
  'stacking-dao': 'stackingDao',
  'xverse-pool': 'xversePool',
  restake: 'restake',
  // custom: 'custom',
} as const;

export function poolSlugToId(slug: PoolSlug) {
  return poolSlugToIdMap[slug];
}

export function providerIdToSlug(providerId: ProviderId) {
  return (
    (Object.entries(poolSlugToIdMap).find(([, id]) => providerId === id)?.[0] as PoolSlug) || null
  );
}

export function getStackingPoolById(id: StackingProviderId) {
  return stackingPoolData[id];
}
export function getPoolFromSlug(slug: PoolSlug) {
  return getStackingPoolById(poolSlugToId(slug));
}

export const poolSlugSchema = z.enum(Object.keys(poolSlugToIdMap) as [PoolSlug, ...PoolSlug[]]);

export type PayoutMethod = 'BTC' | 'STX' | 'OTHER';

export type PoolAddress = Record<NetworkMode, string>;
