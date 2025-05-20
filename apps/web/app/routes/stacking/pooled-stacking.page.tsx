import { MetaDescriptor } from 'react-router';

import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { poolSlugSchema } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { PooledStacking } from '~/pages/stacking/pooled-stacking';

import { Route } from './+types/pooled-stacking.page';

export function loader({ params }: Route.LoaderArgs) {
  const { success, data: poolSlug } = poolSlugSchema.safeParse(params.slug);

  if (!success) throw new Error(`Invalid pool slug: ${poolSlug}`);

  return { poolSlug };
}

export function meta() {
  return [{ title: 'Stacking – Leather' }] satisfies MetaDescriptor[];
}

export default function EarnPooledStackingRoute({ loaderData }: Route.ComponentProps) {
  return (
    <StackingClientProvider>
      <PooledStacking poolSlug={loaderData.poolSlug} />
    </StackingClientProvider>
  );
}
