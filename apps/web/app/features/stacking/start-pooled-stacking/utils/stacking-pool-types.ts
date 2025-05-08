import { z } from 'zod';
import { StackingProviderId, stackingPoolData } from '~/data/data';

export type NetworkMode = 'mainnet' | 'testnet' | 'devnet';

export const poolSlugToIdMap = {
  'fast-pool': 'fastPool',
  'plan-better': 'planbetter',
  'stacking-dao': 'stackingDao',
  xverse: 'xverse',
  restake: 'restake',
  // custom: 'custom',
} as const;

export function poolSlugToId(slug: string) {
  return poolSlugToIdMap[slug as keyof typeof poolSlugToIdMap];
}

export function getStackingPoolById(id: StackingProviderId) {
  return stackingPoolData[id];
}
export function getPoolFromSlug(slug: PoolSlug) {
  return getStackingPoolById(poolSlugToId(slug));
}

export type PoolSlug = keyof typeof poolSlugToIdMap;
export const poolSlugSchema = z.enum(Object.keys(poolSlugToIdMap) as [PoolSlug, ...PoolSlug[]]);

export type PayoutMethod = 'BTC' | 'STX' | 'OTHER';

export type PoolAddress = Record<NetworkMode, string>;
