import { MetaDescriptor, data } from 'react-router';

import { stakingPoolSlugSchema } from '~/data/bitcoin-staking-data';
import { StartStaking } from '~/features/bitcoin-staking/start-staking/start-staking';
import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { Page } from '~/layouts/page/page';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { Route } from './+types/pool-staking.route';

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

export default function PoolStakingRoute({ loaderData }: Route.ComponentProps) {
  return (
    <Page>
      <Page.Header title="Stake with a pool" backTo={stakingPaths.index} />
      <Page.Content>
        <StackingClientProvider>
          <StartStaking poolSlug={loaderData.poolSlug} />
        </StackingClientProvider>
      </Page.Content>
    </Page>
  );
}
