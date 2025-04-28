import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { protocolSlugSchema } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { LiquidStackingActive } from '~/pages/stacking/liquid-stacking-active';

import { Route } from './+types/liquid-stacking-active.page';

export function loader({ params }: Route.LoaderArgs) {
  const { success, data: protocolSlug } = protocolSlugSchema.safeParse(params.slug);

  if (!success) {
    throw new Response(`Invalid protocol slug: ${protocolSlug}`, { status: 404 });
  }

  return { protocolSlug };
}

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Leather Earn - Stacking' }];
}

export default function EarnLiquidStackingActiveRoute({ loaderData }: Route.ComponentProps) {
  return (
    <StackingClientProvider>
      <LiquidStackingActive protocolSlug={loaderData.protocolSlug} />
    </StackingClientProvider>
  );
}
