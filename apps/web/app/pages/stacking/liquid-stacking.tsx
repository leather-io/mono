import { Page } from '~/features/page/page';
import { StartLiquidStacking } from '~/features/stacking/start-liquid-stacking/start-liquid-stacking';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';

interface StackInPoolProps {
  protocolSlug: ProtocolSlug;
}

export function LiquidStacking({ protocolSlug }: StackInPoolProps) {
  return (
    <Page>
      <Page.Header title="Enroll in liquid Stacking" />
      <StartLiquidStacking protocolSlug={protocolSlug} />
    </Page>
  );
}
