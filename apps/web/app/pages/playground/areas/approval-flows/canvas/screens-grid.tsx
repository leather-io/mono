import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { findApprovalDirection } from '../directions/direction-registry';
import type { ApprovalDirection } from '../pattern/approval-direction';
import type { Scenario } from '../scenarios/scenario';
import { canvasTargetId, useCanvasNavigation } from './canvas-navigation';
import { thumbScales, useActiveDirections, useCanvasSettings } from './canvas-settings';
import { ThumbSizeToggle } from './canvas-toolbar';
import { ScenarioFrame, popupWidth } from './scaled-frame';
import type { CanvasScreenSection } from './screen-sections';
import { ThumbCard } from './thumb-card';

const sectionHeaderHeight = 48;

interface GridThumbProps {
  scenario: Scenario;
  direction: ApprovalDirection;
  scale: number;
  isActive: boolean;
}

function GridThumb({ scenario, direction, scale, isActive }: GridThumbProps) {
  const { theme } = useCanvasSettings();
  const { openViewer } = useCanvasNavigation();
  return (
    <ThumbCard
      id={canvasTargetId('screens', scenario.id)}
      width={Math.round(popupWidth * scale)}
      label={scenario.label}
      tag={scenario.history ? 'Then in activity' : undefined}
      title={`${scenario.label} · ${scenario.method}`}
      actionLabel={`Open ${scenario.label} in the viewer`}
      isActive={isActive}
      scrollExtra={sectionHeaderHeight}
      onOpen={() => openViewer(scenario.id)}
    >
      <ScenarioFrame
        scenario={scenario}
        direction={direction}
        scale={scale}
        theme={theme}
        thumbId={`grid-${scenario.id}`}
        isLazy
      />
    </ThumbCard>
  );
}

interface DirectionStatusButtonProps {
  label: string;
  onClick(): void;
}

function DirectionStatusButton({ label, onClick }: DirectionStatusButtonProps) {
  return (
    <styled.button
      type="button"
      onClick={onClick}
      textStyle="caption.01"
      color="ink.text-subdued"
      px="space.02"
      py="1px"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="round"
      cursor="pointer"
      _hover={{ color: 'ink.text-primary', borderColor: 'ink.text-primary' }}
    >
      {label}
    </styled.button>
  );
}

interface ScreensGridProps {
  sections: CanvasScreenSection[];
}

export function ScreensGrid({ sections }: ScreensGridProps) {
  const { thumbSize, direction, discardedDirections, setDirectionDiscarded } = useCanvasSettings();
  const activeCount = useActiveDirections().length;
  const { activeId } = useCanvasNavigation();
  const scale = thumbScales[thumbSize];
  const width = Math.round(popupWidth * scale);
  const activeDirection = findApprovalDirection(direction);
  return (
    <Stack gap="space.07" pt="space.04" pb="space.11">
      <Flex gap="space.05" alignItems="flex-end" justifyContent="space-between">
        <Stack gap="space.01" minWidth="0" maxWidth="640px">
          <Flex alignItems="center" gap="space.03">
            <styled.h1 textStyle="label.01" color="ink.text-primary">
              {activeDirection.name}
            </styled.h1>
            {discardedDirections.includes(activeDirection.id) ? (
              <>
                <styled.span
                  textStyle="caption.02"
                  color="ink.text-subdued"
                  px="space.02"
                  borderWidth={1}
                  borderStyle="dashed"
                  borderColor="ink.border-default"
                  borderRadius="round"
                >
                  Discarded
                </styled.span>
                <DirectionStatusButton
                  label="Restore"
                  onClick={() => setDirectionDiscarded(activeDirection.id, false)}
                />
              </>
            ) : (
              activeCount > 1 && (
                <DirectionStatusButton
                  label="Discard"
                  onClick={() => setDirectionDiscarded(activeDirection.id, true)}
                />
              )
            )}
          </Flex>
          <styled.p textStyle="body.02" color="ink.text-primary">
            {activeDirection.description}
          </styled.p>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            Inspired by {activeDirection.inspiration}
          </styled.p>
        </Stack>
        <ThumbSizeToggle />
      </Flex>
      {sections.map(section => (
        <Box
          as="section"
          key={section.id}
          id={canvasTargetId('screens', section.id)}
          aria-label={section.label}
        >
          <Flex
            position="sticky"
            zIndex={5}
            alignItems="baseline"
            gap="space.03"
            bg="ink.background-primary"
            borderBottomWidth={1}
            borderColor="ink.border-default"
            py="space.03"
            style={{ top: 'var(--canvas-toolbar-height, 0px)' }}
          >
            <styled.h2 textStyle="label.02">{section.label}</styled.h2>
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              {section.scenarios.length}
            </styled.span>
          </Flex>
          <Box
            display="grid"
            columnGap="space.05"
            rowGap="space.06"
            pt="space.05"
            style={{ gridTemplateColumns: `repeat(auto-fill, ${width}px)` }}
          >
            {section.scenarios.map(scenario => (
              <GridThumb
                key={scenario.id}
                scenario={scenario}
                direction={activeDirection}
                scale={scale}
                isActive={scenario.id === activeId}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
