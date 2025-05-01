import { Page } from '~/features/page/page';
import { StartPooledStacking } from '~/features/stacking/start-pooled-stacking/start-pooled-stacking';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/types-preset-pools';

interface PooledStackingProps {
  poolSlug: PoolSlug;
}

export function PooledStacking({ poolSlug }: PooledStackingProps) {
  return (
    <Page>
      <Page.Header title="Stack in a pool" />
      <StartPooledStacking poolSlug={poolSlug} />
    </Page>
  );
}
