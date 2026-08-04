import { MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';
import { ByosmStaking } from '~/features/bitcoin-staking/byosm/byosm-staking';
import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { Page } from '~/layouts/page/page';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

export function meta() {
  return [{ title: 'Bitcoin Staking – Leather' }] satisfies MetaDescriptor[];
}

// Client-only: a server-rendered contract-entry form can be submitted before
// hydration, which triggers a native GET navigation instead of the in-page
// validation flow.
export default function ByosmStakingRoute() {
  return (
    <Page>
      <Page.Header title="Stake with a pool" backTo={stakingPaths.index} />
      <Page.Content>
        <WhenClient>
          <StackingClientProvider>
            <ByosmStaking />
          </StackingClientProvider>
        </WhenClient>
      </Page.Content>
    </Page>
  );
}
