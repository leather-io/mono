import { MetaDescriptor, data } from 'react-router';

import { stakingPoolSlugSchema } from '~/data/bitcoin-staking-data';
import { StakingActiveInfo } from '~/features/bitcoin-staking/staking-active/staking-active-info';
import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';

import { Route } from './+types/pool-staking-active.route';

export function loader({ params }: Route.LoaderArgs) {
  const { success, data: poolSlug } = stakingPoolSlugSchema.safeParse(params.slug);

  if (!success) {
    throw data(`Pool not found: ${params.slug}`, { status: 404 });
  }

  return { poolSlug };
}

export function meta() {
  return [{ title: 'Bitcoin Staking – Leather' }] satisfies MetaDescriptor[];
}

export default function PoolStakingActiveRoute({ loaderData }: Route.ComponentProps) {
  return (
    <StackingClientProvider>
      <StakingActiveInfo poolSlug={loaderData.poolSlug} />
    </StackingClientProvider>
  );
}
