import { LoadingOverlay } from '~/components/loading-overlay';
import { NotWalletFoundOverlay } from '~/components/not-wallet-fount-overlay';
import { Page } from '~/features/page/page';
import { LiquidStackingActiveInfo } from '~/features/stacking/liquid-stacking-active-info';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { useLeatherConnect } from '~/store/addresses';

interface LiquidStackingActiveProps {
  protocolSlug: ProtocolSlug;
}

export function LiquidStackingActive({ protocolSlug }: LiquidStackingActiveProps) {
  const { whenExtensionState } = useLeatherConnect();

  return (
    <Page>
      <Page.Header title="Liquid Stacking" />
      {whenExtensionState({
        connected: <LiquidStackingActiveInfo protocolSlug={protocolSlug} />,
        detected: <LoadingOverlay />,
        missing: <NotWalletFoundOverlay />,
      })}
    </Page>
  );
}
