import { Page } from '~/features/page/page';
import { StartPooledStacking } from '~/features/stacking/start-pooled-stacking';
import { PoolName } from '~/features/stacking/utils/types-preset-pools';

interface StackInPoolProps {
  poolName: PoolName;
}

export function StackInPool({ poolName }: StackInPoolProps) {
  return (
    <Page>
      <Page.Header title="Enroll" />

      <StartPooledStacking poolName={poolName} />
    </Page>
  );
}
