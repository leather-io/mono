import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { validatePoolSlug } from '~/features/stacking/utils/stacking-pools-validator';
import {
  PoolIdToDisplayNameMap,
  PoolSlug,
  PoolSlugToIdMap,
} from '~/features/stacking/utils/types-preset-pools';
import { PooledStacking } from '~/pages/stacking/pooled-stacking';

import { delay } from '@leather.io/utils';

import { Route } from './+types/pooled-stacking';

export async function loader({ params }: Route.LoaderArgs) {
  await delay(400);

  const isSlugValid = validatePoolSlug(params.slug);

  if (!isSlugValid) {
    throw new Response(`Invalid pool slug: ${params.slug}`, { status: 404 });
  }

  const poolSlug = params.slug as PoolSlug;
  const poolId = PoolSlugToIdMap[poolSlug];
  const poolName = PoolIdToDisplayNameMap[poolId];

  return { poolName };
}

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Leather Earn - Stacking' }];
}

export default function EarnPooledStackingRoute({ loaderData }: Route.ComponentProps) {
  return (
    <StackingClientProvider>
      <PooledStacking poolName={loaderData.poolName} />
    </StackingClientProvider>
  );
}
