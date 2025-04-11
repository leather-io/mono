import { Page } from '~/features/page/page';
import { PooledStackingActiveInfo } from '~/features/stacking/pooled-stacking-active-info';
import { PoolSlug } from '~/features/stacking/utils/types-preset-pools';

interface PooledStackingActiveProps {
  poolSlug: PoolSlug;
}

export function PooledStackingActive({ poolSlug }: PooledStackingActiveProps) {
  return (
    <Page>
      <Page.Header title="Pooled Stacking" />
      <PooledStackingActiveInfo poolSlug={poolSlug} />
    </Page>
  );
}
