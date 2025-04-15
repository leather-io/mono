import { Page } from '~/features/page/page';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';

interface LiquidStackingActiveProps {
  protocolSlug: ProtocolSlug;
}

export function LiquidStackingActive({ protocolSlug }: LiquidStackingActiveProps) {
  return (
    <Page>
      <Page.Header title="Liquid Stacking" />
      {protocolSlug}
      {/* <LiquidStackingActiveInfo poolSlug={poolSlug} /> */}
    </Page>
  );
}
