import { Page } from '~/features/page/page';
import { StartPooledStacking } from '~/features/stacking/start-pooled-stacking';
import { PoolName } from '~/features/stacking/utils/types-preset-pools';

interface PooledStackingProps {
  poolName: PoolName;
}

export function PooledStacking({ poolName }: PooledStackingProps) {
  return (
    <Page>
      <Page.Header title="Enroll" />
      <StartPooledStacking poolName={poolName} />
    </Page>
  );
}
