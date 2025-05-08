import { z } from 'zod';
import { stackingProviderData } from '~/data/data';

export type NetworkMode = 'mainnet' | 'testnet' | 'devnet';

export const poolSlugToIdMap = {
  'fast-pool': 'fastpool',
  'plan-better': 'planbetter',
  'stacking-dao': 'stackingDao',
  xverse: 'xverse',
  restake: 'restake',
  // custom: 'custom',
} as const;

export function poolSlugToId(slug: string) {
  return poolSlugToIdMap[slug as keyof typeof poolSlugToIdMap];
}

export function getPoolFromSlug(slug: PoolSlug) {
  return stackingProviderData[poolSlugToId(slug)];
}

export function getStackingPoolById(id: PoolId) {
  return stackingProviderData[id];
}

export type PoolSlug = keyof typeof poolSlugToIdMap;
export const poolSlugSchema = z.enum(Object.keys(poolSlugToIdMap) as [PoolSlug, ...PoolSlug[]]);

export type PoolId = (typeof poolSlugToIdMap)[PoolSlug];

export type PayoutMethod = 'BTC' | 'STX' | 'OTHER';

export type PoolAddress = Record<NetworkMode, string>;
