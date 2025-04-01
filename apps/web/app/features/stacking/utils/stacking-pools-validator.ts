import { z } from 'zod';

import { PoolSlugToIdMap } from './types-preset-pools';

export function validatePoolSlug(slug: string) {
  const poolSlugs = Object.keys(PoolSlugToIdMap);

  const poolSlugSchema = z.enum(poolSlugs as [string, ...string[]]);
  const result = poolSlugSchema.safeParse(slug);

  return result.success;
}
