import { WhenClient } from '~/components/client-only';
import { StartPooledStacking } from '~/features/stacking/start-pooled-stacking/start-pooled-stacking';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { Page } from '~/layouts/page/page';

interface PooledStackingProps {
  poolSlug: PoolSlug;
}

export function PooledStacking({ poolSlug }: PooledStackingProps) {
  return (
    <Page>
      <Page.Header title="Stack in a pool" />
      <WhenClient>
        <StartPooledStacking poolSlug={poolSlug} />
      </WhenClient>
    </Page>
  );
}
