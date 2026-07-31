import { MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';
import { ByosmStaking } from '~/features/bitcoin-staking/byosm/byosm-staking';
import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { Page } from '~/layouts/page/page';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

export function meta() {
  return [{ title: 'Bitcoin Staking – Leather' }] satisfies MetaDescriptor[];
}

export default function ByosmStakingRoute() {
  return (
    <Page>
      <Page.Header title="Stake with a pool" backTo={stakingPaths.index} />
      <StackingClientProvider>
        <WhenClient>
          <ByosmStaking />
        </WhenClient>
      </StackingClientProvider>
    </Page>
  );
}
