import { LoadingOverlay } from '~/components/loading-overlay';
import { NotWalletFoundOverlay } from '~/components/not-wallet-fount-overlay';
import { Page } from '~/features/page/page';
import { StartLiquidStacking } from '~/features/stacking/start-liquid-stacking/start-liquid-stacking';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { useLeatherConnect } from '~/store/addresses';

interface StackInPoolProps {
  protocolSlug: ProtocolSlug;
}

export function LiquidStacking({ protocolSlug }: StackInPoolProps) {
  const { whenExtensionState } = useLeatherConnect();

  return (
    <Page>
      <Page.Header title="Enroll in liquid stacking" />
      {whenExtensionState({
        connected: <StartLiquidStacking protocolSlug={protocolSlug} />,
        detected: <LoadingOverlay />,
        missing: <NotWalletFoundOverlay />,
      })}
    </Page>
  );
}
