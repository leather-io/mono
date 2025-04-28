import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { poolSlugSchema } from '~/features/stacking/start-pooled-stacking/utils/types-preset-pools';
import { PooledStackingActive } from '~/pages/stacking/pooled-stacking-active';

import { Route } from './+types/pooled-stacking-active.page';

export function loader({ params }: Route.LoaderArgs) {
  const { success, data: poolSlug } = poolSlugSchema.safeParse(params.slug);

  if (!success) {
    throw new Response(`Invalid pool slug: ${poolSlug}`, { status: 404 });
  }

  return { poolSlug };
}

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Leather Earn - Stacking' }];
}

export default function EarnPooledStackingActiveRoute({ loaderData }: Route.ComponentProps) {
  return (
    <StackingClientProvider>
      <PooledStackingActive poolSlug={loaderData.poolSlug} />
    </StackingClientProvider>
  );
}
