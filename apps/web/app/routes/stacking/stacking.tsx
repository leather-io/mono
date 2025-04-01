import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { validatePoolSlug } from '~/features/stacking/utils/stacking-pools-validator';
import {
  PoolIdToDisplayNameMap,
  PoolSlug,
  PoolSlugToIdMap,
} from '~/features/stacking/utils/types-preset-pools';
import { StackInPool } from '~/pages/stacking/stack-in-pool';

import { delay } from '@leather.io/utils';

import type { Route } from './+types/stacking';

export async function loader() {
  await delay(400);
  return true;
}

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Leather Earn - Stacking' }];
}

export default function EarnStackingRoute({ params }: Route.ComponentProps) {
  const isSlugValid = validatePoolSlug(params.slug);

  if (!isSlugValid) {
    throw new Error(`Invalid pool slug: ${params.slug}`);
  }

  const poolSlug = params.slug as PoolSlug;
  const poolId = PoolSlugToIdMap[poolSlug];
  const poolName = PoolIdToDisplayNameMap[poolId];

  return (
    <StackingClientProvider>
      <StackInPool poolName={poolName} />
    </StackingClientProvider>
  );
}
