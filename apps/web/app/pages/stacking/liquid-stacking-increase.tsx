import { LoadingOverlay } from '~/components/loading-overlay';
import { NotWalletFoundOverlay } from '~/components/not-wallet-fount-overlay';
import { Page } from '~/features/page/page';
import { IncreaseLiquidStacking } from '~/features/stacking/increase-liquid-stacking/increase-liquid-stacking';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { useLeatherConnect } from '~/store/addresses';

interface StackInPoolProps {
  protocolSlug: ProtocolSlug;
}

export function LiquidStackingIncrease({ protocolSlug }: StackInPoolProps) {
  const { whenExtensionState } = useLeatherConnect();

  return (
    <Page>
      <Page.Header title="Increase liquid stacking" />
      {whenExtensionState({
        connected: <IncreaseLiquidStacking protocolSlug={protocolSlug} />,
        detected: <LoadingOverlay />,
        missing: <NotWalletFoundOverlay />,
      })}
    </Page>
  );
}
