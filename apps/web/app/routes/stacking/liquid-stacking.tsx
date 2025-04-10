import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import {
  ProtocolIdToDisplayNameMap,
  ProtocolSlugToIdMap,
  protocolSlugSchema,
} from '~/features/stacking/utils/types-preset-protocols';
import { LiquidStacking } from '~/pages/stacking/liquid-stacking';

import { delay } from '@leather.io/utils';

import { Route } from './+types/liquid-stacking';

export async function loader({ params }: Route.LoaderArgs) {
  await delay(400);

  const { success, data: protocolSlug } = protocolSlugSchema.safeParse(params.slug);

  if (!success) {
    throw new Response(`Invalid protocol slug: ${params.slug}`, { status: 404 });
  }

  const protocolId = ProtocolSlugToIdMap[protocolSlug];
  const protocolName = ProtocolIdToDisplayNameMap[protocolId];

  return { protocolName };
}

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Leather Earn - Stacking' }];
}

export default function EarnLiquidStackingRoute({ loaderData }: Route.ComponentProps) {
  return (
    <StackingClientProvider>
      <LiquidStacking protocolName={loaderData.protocolName} />
    </StackingClientProvider>
  );
}
