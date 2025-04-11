import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { validatePoolSlug } from '~/features/stacking/utils/stacking-pools-validator';
import { PoolSlug } from '~/features/stacking/utils/types-preset-pools';
import { PooledStackingActive } from '~/pages/stacking/pooled-stacking-active';

import { Route } from './+types/pooled-stacking-active';

export function loader({ params }: Route.LoaderArgs) {
  const isSlugValid = validatePoolSlug(params.slug);

  if (!isSlugValid) {
    throw new Response(`Invalid pool slug: ${params.slug}`, { status: 404 });
  }

  const poolSlug = params.slug as PoolSlug;

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
