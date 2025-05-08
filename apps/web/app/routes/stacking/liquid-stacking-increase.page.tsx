import { MetaDescriptor } from 'react-router';

import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { protocolSlugSchema } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { LiquidStackingIncrease } from '~/pages/stacking/liquid-stacking-increase';

import { Route } from './+types/liquid-stacking-increase.page';

export function loader({ params }: Route.LoaderArgs) {
  const { success, data: protocolSlug } = protocolSlugSchema.safeParse(params.slug);

  if (!success) throw new Response(`Invalid protocol slug: ${protocolSlug}`, { status: 404 });

  return { protocolSlug };
}

export function meta() {
  return [{ title: 'Liquid Stacking – Increase – Leather' }] satisfies MetaDescriptor[];
}

export default function EarnLiquidStackingIncreaseRoute({ loaderData }: Route.ComponentProps) {
  return (
    <StackingClientProvider>
      <LiquidStackingIncrease protocolSlug={loaderData.protocolSlug} />
    </StackingClientProvider>
  );
}
