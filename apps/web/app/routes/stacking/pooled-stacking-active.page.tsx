import { MetaDescriptor } from 'react-router';

import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { poolSlugSchema } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { PooledStackingActive } from '~/pages/stacking/pooled-stacking-active';

import { Route } from './+types/pooled-stacking-active.page';

export function loader({ params }: Route.LoaderArgs) {
  const { success, data: poolSlug } = poolSlugSchema.safeParse(params.slug);

  if (!success) throw new Response(`Invalid pool slug: ${poolSlug}`, { status: 404 });

  return { poolSlug };
}

export function meta() {
  return [{ title: 'Stacking – Leather' }] satisfies MetaDescriptor[];
}

export default function EarnPooledStackingActiveRoute({ loaderData }: Route.ComponentProps) {
  return (
    <StackingClientProvider>
      <PooledStackingActive poolSlug={loaderData.poolSlug} />
    </StackingClientProvider>
  );
}
