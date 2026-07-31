import { MetaDescriptor, data } from 'react-router';

import { stakingPoolSlugSchema } from '~/data/bitcoin-staking-data';
import { UpdateStaking } from '~/features/bitcoin-staking/update-staking/update-staking';
import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { Page } from '~/layouts/page/page';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { Route } from './+types/pool-staking-update.route';

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

export default function PoolStakingUpdateRoute({ loaderData }: Route.ComponentProps) {
  return (
    <Page>
      <Page.Header title="Update staking" backTo={stakingPaths.active(loaderData.poolSlug)} />
      <StackingClientProvider>
        <UpdateStaking poolSlug={loaderData.poolSlug} />
      </StackingClientProvider>
    </Page>
  );
}
