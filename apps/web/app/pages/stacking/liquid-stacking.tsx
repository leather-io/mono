import { Page } from '~/features/page/page';
import { StartLiquidStacking } from '~/features/stacking/start-liquid-stacking';
import { ProtocolName } from '~/features/stacking/utils/types-preset-protocols';

interface StackInPoolProps {
  protocolName: ProtocolName;
}

export function LiquidStacking({ protocolName }: StackInPoolProps) {
  return (
    <Page>
      <Page.Header title="Enroll in liquid stacking" />
      <StartLiquidStacking protocolName={protocolName} />
    </Page>
  );
}
