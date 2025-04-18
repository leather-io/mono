import { Page } from '~/features/page/page';
import { LiquidStackingActiveInfo } from '~/features/stacking/liquid-stacking-active-info';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';

interface LiquidStackingActiveProps {
  protocolSlug: ProtocolSlug;
}

export function LiquidStackingActive({ protocolSlug }: LiquidStackingActiveProps) {
  return (
    <Page>
      <Page.Header title="Liquid Stacking" />
      <LiquidStackingActiveInfo protocolSlug={protocolSlug} />
    </Page>
  );
}
