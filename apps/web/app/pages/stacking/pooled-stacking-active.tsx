import { LoadingOverlay } from '~/components/loading-overlay';
import { NotWalletFoundOverlay } from '~/components/not-wallet-fount-overlay';
import { Page } from '~/features/page/page';
import { PooledStackingActiveInfo } from '~/features/stacking/pooled-stacking-active-info';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { useLeatherConnect } from '~/store/addresses';

interface PooledStackingActiveProps {
  poolSlug: PoolSlug;
}

export function PooledStackingActive({ poolSlug }: PooledStackingActiveProps) {
  const { whenExtensionState } = useLeatherConnect();

  return (
    <Page>
      <Page.Header title="Pooled Stacking" />
      {whenExtensionState({
        connected: <PooledStackingActiveInfo poolSlug={poolSlug} />,
        detected: <LoadingOverlay />,
        missing: <NotWalletFoundOverlay />,
      })}
    </Page>
  );
}
