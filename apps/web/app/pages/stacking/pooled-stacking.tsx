import { LoadingOverlay } from '~/components/loading-overlay';
import { NotWalletFoundOverlay } from '~/components/not-wallet-fount-overlay';
import { Page } from '~/features/page/page';
import { StartPooledStacking } from '~/features/stacking/start-pooled-stacking/start-pooled-stacking';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { useLeatherConnect } from '~/store/addresses';

interface PooledStackingProps {
  poolSlug: PoolSlug;
}

export function PooledStacking({ poolSlug }: PooledStackingProps) {
  const { whenExtensionState } = useLeatherConnect();

  return (
    <Page>
      <Page.Header title="Stack in a pool" />
      {whenExtensionState({
        connected: <StartPooledStacking poolSlug={poolSlug} />,
        detected: <LoadingOverlay />,
        missing: <NotWalletFoundOverlay />,
      })}
    </Page>
  );
}
