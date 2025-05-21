import { Page } from '~/features/page/page';
import { IncreaseLiquidStacking } from '~/features/stacking/increase-liquid-stacking/increase-liquid-stacking';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';

interface StackInPoolProps {
  protocolSlug: ProtocolSlug;
}

export function LiquidStackingIncrease({ protocolSlug }: StackInPoolProps) {
  return (
    <Page>
      <Page.Header title="Increase liquid Stacking" />
      <IncreaseLiquidStacking protocolSlug={protocolSlug} />
    </Page>
  );
}
