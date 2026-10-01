import { type ApprovalDirection, ApprovalDirectionProvider } from '../pattern/approval-direction';
import { ApprovalOptionsProvider } from '../pattern/approval-options';
import type { Scenario } from '../scenarios/scenario';
import { useCanvasSettings } from './canvas-settings';

interface ScenarioRenderProps {
  scenario: Scenario;
  direction: ApprovalDirection;
  isSolo?: boolean;
  isHistory?: boolean;
}

export function ScenarioRender({ scenario, direction, isSolo, isHistory }: ScenarioRenderProps) {
  const {
    titleStyle,
    networkLabel,
    accountPlacement,
    headerSurface,
    headerRadius,
    footerEdge,
    containers,
    launch,
    replayKey,
  } = useCanvasSettings();
  const overrides = direction.optionOverrides;
  return (
    <ApprovalDirectionProvider key={replayKey} direction={direction}>
      <ApprovalOptionsProvider
        titleStyle={titleStyle}
        networkLabel={networkLabel}
        accountPlacement={overrides?.accountPlacement ?? accountPlacement}
        headerSurface={headerSurface}
        headerRadius={headerRadius}
        footerEdge={footerEdge}
        containers={overrides?.containers ?? containers}
        launch={launch}
        isConnect={scenario.family === 'connect'}
        isSolo={isSolo}
      >
        {isHistory && scenario.history ? scenario.history() : scenario.render()}
      </ApprovalOptionsProvider>
    </ApprovalDirectionProvider>
  );
}
