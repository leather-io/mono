import { type ApprovalDirection, ApprovalDirectionProvider } from '../pattern/approval-direction';
import { ApprovalOptionsProvider } from '../pattern/approval-options';
import type { Scenario } from '../scenarios/scenario';
import { useCanvasSettings } from './canvas-settings';

interface ScenarioRenderProps {
  scenario: Scenario;
  direction: ApprovalDirection;
  isSolo?: boolean;
  isHistory?: boolean;
  hasLaunch?: boolean;
}

export function ScenarioRender({
  scenario,
  direction,
  isSolo,
  isHistory,
  hasLaunch,
}: ScenarioRenderProps) {
  const { titleStyle, headerSurface, headerRadius, replayKey } = useCanvasSettings();
  return (
    <ApprovalDirectionProvider key={replayKey} direction={direction}>
      <ApprovalOptionsProvider
        titleStyle={titleStyle}
        headerSurface={headerSurface}
        headerRadius={headerRadius}
        containers={direction.optionOverrides?.containers}
        hasLaunch={hasLaunch && !isHistory}
        isConnect={scenario.family === 'connect'}
        isSolo={isSolo}
      >
        {isHistory && scenario.history ? scenario.history() : scenario.render()}
      </ApprovalOptionsProvider>
    </ApprovalDirectionProvider>
  );
}
