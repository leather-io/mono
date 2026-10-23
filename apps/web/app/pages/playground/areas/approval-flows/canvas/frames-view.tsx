import { Flex, Stack, styled } from 'leather-styles/jsx';

import { approvalDirections, findApprovalDirection } from '../directions/direction-registry';
import type { Scenario } from '../scenarios/scenario';
import { useCanvasSettings } from './canvas-settings';
import { CaptureFrame } from './capture-frame';
import { PopupFrame } from './popup-frame';
import { ScenarioRender } from './scenario-render';
import type { CanvasScreenSection } from './screen-sections';

interface FrameRowProps {
  scenario: Scenario;
}

function FrameCapture({ scenario }: FrameRowProps) {
  const { showToday } = useCanvasSettings();
  if (!showToday || !scenario.captureId) return null;
  return <CaptureFrame captureId={scenario.captureId} />;
}

function SingleDirectionFrames({ scenario }: FrameRowProps) {
  const { theme, direction, showActivity } = useCanvasSettings();
  const active = findApprovalDirection(direction);
  return (
    <Flex gap="space.05" alignItems="flex-start">
      <FrameCapture scenario={scenario} />
      <PopupFrame
        caption={`${scenario.label} · ${active.name}`}
        theme={theme}
        frameId={scenario.id}
      >
        <ScenarioRender scenario={scenario} direction={active} />
      </PopupFrame>
      {showActivity && scenario.history && (
        <PopupFrame
          caption={`Then in activity · ${active.name}`}
          theme={theme}
          frameId={`${scenario.id}--activity`}
        >
          <ScenarioRender scenario={scenario} direction={active} isHistory />
        </PopupFrame>
      )}
    </Flex>
  );
}

function AllDirectionFrames({ scenario }: FrameRowProps) {
  const { theme, showActivity } = useCanvasSettings();
  const isHistory = showActivity && scenario.history !== undefined;
  return (
    <Stack gap="space.02" width="100%">
      <styled.h2 textStyle="label.02">{scenario.label}</styled.h2>
      <Flex gap="space.05" alignItems="flex-start" flexWrap="wrap">
        <FrameCapture scenario={scenario} />
        {approvalDirections.map(item => (
          <PopupFrame
            key={item.id}
            caption={isHistory ? `${item.name} · then in activity` : item.name}
            theme={theme}
            frameId={
              isHistory ? `${scenario.id}--${item.id}--activity` : `${scenario.id}--${item.id}`
            }
          >
            <ScenarioRender scenario={scenario} direction={item} isHistory={isHistory} />
          </PopupFrame>
        ))}
      </Flex>
    </Stack>
  );
}

interface FramesViewProps {
  sections: CanvasScreenSection[];
}

export function FramesView({ sections }: FramesViewProps) {
  const { isCompare } = useCanvasSettings();
  const scenarios = sections.flatMap(section => section.scenarios);
  return (
    <Flex
      data-frames-view
      gap="space.07"
      flexWrap="wrap"
      alignItems="flex-start"
      p="space.06"
      bg="ink.background-primary"
      minHeight="100vh"
    >
      {scenarios.map(scenario =>
        isCompare ? (
          <AllDirectionFrames key={scenario.id} scenario={scenario} />
        ) : (
          <SingleDirectionFrames key={scenario.id} scenario={scenario} />
        )
      )}
    </Flex>
  );
}
