import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { PoolNameSlugMap, PoolSlug } from '~/features/stacking/utils/types-preset-pools';

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
  const poolSlug = params.slug as PoolSlug;
  const poolName = PoolNameSlugMap[poolSlug];

  if (!poolName) throw new Error(`Uknown pool - ${poolSlug}`);

  return (
    <StackingClientProvider>
      <div>Stacking</div>
    </StackingClientProvider>
  );
}
