import { MetaDescriptor } from 'react-router';

import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { protocolSlugSchema } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { LiquidStacking } from '~/pages/stacking/liquid-stacking';

import { Route } from './+types/liquid-stacking.page';

export function loader({ params }: Route.LoaderArgs) {
  const { success, data: protocolSlug } = protocolSlugSchema.safeParse(params.slug);

  if (!success) throw new Response(`Invalid protocol slug: ${params.slug}`, { status: 404 });

  return { protocolSlug };
}

export function meta() {
  return [{ title: 'Liquid Stacking – Leather' }] satisfies MetaDescriptor[];
}

export default function EarnLiquidStackingRoute({ loaderData }: Route.ComponentProps) {
  return (
    <StackingClientProvider>
      <LiquidStacking protocolSlug={loaderData.protocolSlug} />
    </StackingClientProvider>
  );
}
