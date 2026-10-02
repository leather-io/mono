import { type ReactNode, useEffect, useRef } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { findApprovalDirection } from '../directions/direction-registry';
import type { ApprovalDirection } from '../pattern/approval-direction';
import type { Scenario } from '../scenarios/scenario';
import { useCanvasNavigation } from './canvas-navigation';
import { useActiveDirections, useCanvasSettings, useComparedDirections } from './canvas-settings';
import { ViewerIssues } from './issues-panel';
import { Kbd } from './kbd';
import { ScaledCapture, ScenarioFrame, popupHeight, popupWidth } from './scaled-frame';
import type { CanvasScreenSection } from './screen-sections';
import { ThumbCard } from './thumb-card';
import { useElementSize } from './use-element-size';
import { ViewerDecisions } from './viewer-decisions';
import { ViewerMeasurement } from './viewer-measurement';
import { ViewerWhy } from './viewer-why';

const stageGap = 16;
const captionHeight = 24;
const maxStageScale = 1.25;
const filmstripScale = 0.12;

const hiddenScrollbar = css({
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
});

interface ViewerEntry {
  scenario: Scenario;
  section: CanvasScreenSection;
}

interface ViewerButtonProps {
  isPressed?: boolean;
  isDisabled?: boolean;
  title?: string;
  onClick(): void;
  children: ReactNode;
}

function ViewerButton({ isPressed, isDisabled, title, onClick, children }: ViewerButtonProps) {
  return (
    <styled.button
      type="button"
      aria-pressed={isPressed}
      disabled={isDisabled}
      title={title}
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap="space.02"
      textStyle="label.03"
      px="space.03"
      py="space.01"
      borderWidth={1}
      borderColor={isPressed ? 'ink.action-primary-default' : 'ink.border-default'}
      borderRadius="round"
      bg={isPressed ? 'ink.action-primary-default' : 'ink.background-primary'}
      color={isPressed ? 'ink.background-primary' : 'ink.text-primary'}
      whiteSpace="nowrap"
      cursor="pointer"
      _disabled={{ opacity: 0.4, cursor: 'default' }}
    >
      {children}
    </styled.button>
  );
}

function BackButton() {
  const { isCompare } = useCanvasSettings();
  const { closeViewer, viewerOrigin } = useCanvasNavigation();
  const screensLabel = isCompare ? 'Screens, compared' : 'Screens';
  return (
    <ViewerButton onClick={closeViewer} title="Back to where you came from">
      ← {viewerOrigin ? 'About' : screensLabel} <Kbd>Esc</Kbd>
    </ViewerButton>
  );
}

interface StepButtonsProps {
  index: number;
  count: number;
}

function StepButtons({ index, count }: StepButtonsProps) {
  const { move } = useCanvasNavigation();
  return (
    <Flex gap="space.02" alignItems="center">
      <ViewerButton isDisabled={index <= 0} onClick={() => move(-1)} title="Previous screen">
        <Kbd>←</Kbd> Previous
      </ViewerButton>
      <ViewerButton isDisabled={index >= count - 1} onClick={() => move(1)} title="Next screen">
        Next <Kbd>→</Kbd>
      </ViewerButton>
    </Flex>
  );
}

interface ViewerTogglesProps {
  hasHistory: boolean;
}

function ViewerToggles({ hasHistory }: ViewerTogglesProps) {
  const { isViewerCompare, showToday, showActivity, update } = useCanvasSettings();
  return (
    <Flex gap="space.02" alignItems="center" flexWrap="wrap">
      <ViewerButton
        isPressed={isViewerCompare}
        onClick={() => update({ isViewerCompare: !isViewerCompare })}
        title="Show every direction side by side"
      >
        Compare <Kbd>c</Kbd>
      </ViewerButton>
      <ViewerButton
        isPressed={showToday}
        onClick={() => update({ showToday: !showToday })}
        title="Add today’s real capture where one exists"
      >
        Today <Kbd>t</Kbd>
      </ViewerButton>
      {hasHistory && (
        <ViewerButton
          isPressed={showActivity}
          onClick={() => update({ showActivity: !showActivity })}
          title="Show the same request as it later appears in activity details"
        >
          Then in activity <Kbd>a</Kbd>
        </ViewerButton>
      )}
    </Flex>
  );
}

function DirectionTabs() {
  const { direction, update } = useCanvasSettings();
  const active = findApprovalDirection(direction);
  const activeDirections = useActiveDirections();
  const tabs = activeDirections.some(item => item.id === active.id)
    ? activeDirections
    : [...activeDirections, active];
  return (
    <Flex
      role="tablist"
      aria-label="Direction"
      className={hiddenScrollbar}
      overflowX="auto"
      gap="space.01"
      borderBottomWidth={1}
      borderColor="ink.border-default"
      flexShrink={0}
    >
      {tabs.map(item => {
        const isSelected = item.id === active.id;
        return (
          <styled.button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            title={item.description}
            onClick={() => update({ direction: item.id })}
            display="flex"
            alignItems="center"
            gap="space.02"
            textStyle="label.03"
            px="space.03"
            py="space.02"
            mb="-1px"
            borderBottomWidth={2}
            borderColor={isSelected ? 'ink.text-primary' : 'transparent'}
            color={isSelected ? 'ink.text-primary' : 'ink.text-subdued'}
            whiteSpace="nowrap"
            cursor="pointer"
            _hover={{ color: 'ink.text-primary' }}
          >
            {item.name}
          </styled.button>
        );
      })}
    </Flex>
  );
}

interface ScreenMetaProps {
  entry: ViewerEntry;
  index: number;
  count: number;
}

function ScreenMeta({ entry, index, count }: ScreenMetaProps) {
  return (
    <Stack gap="space.01" minWidth="0">
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {entry.section.label} · {index + 1} of {count}
      </styled.span>
      <styled.h2 textStyle="label.01">{entry.scenario.label}</styled.h2>
      <styled.code textStyle="caption.02" color="ink.text-subdued">
        {entry.scenario.method}
      </styled.code>
    </Stack>
  );
}

interface ViewerPanelProps {
  entry: ViewerEntry;
  index: number;
  count: number;
  direction: ApprovalDirection;
}

function ViewerSidePanel({ entry, index, count, direction }: ViewerPanelProps) {
  return (
    <Stack
      as="aside"
      width="300px"
      flexShrink={0}
      gap="space.05"
      overflowY="auto"
      className={hiddenScrollbar}
      pb="space.04"
    >
      <Flex>
        <BackButton />
      </Flex>
      <ScreenMeta entry={entry} index={index} count={count} />
      <styled.p
        textStyle="body.02"
        color="ink.text-primary"
        borderLeft="default"
        pl="space.03"
        whiteSpace="pre-line"
      >
        {entry.scenario.note}
      </styled.p>
      <ViewerIssues scenario={entry.scenario} />
      <ViewerWhy scenarioId={entry.scenario.id} />
      <StepButtons index={index} count={count} />
      <ViewerToggles hasHistory={entry.scenario.history !== undefined} />
      <Stack gap="space.01" borderTopWidth={1} borderColor="ink.border-default" pt="space.04">
        <styled.span textStyle="label.03">{direction.name}</styled.span>
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          {direction.description} Inspired by {direction.inspiration}.
        </styled.p>
      </Stack>
      <ViewerDecisions scenarioId={entry.scenario.id} />
      <ViewerMeasurement events={entry.scenario.events} directionId={direction.id} />
    </Stack>
  );
}

function ViewerInfoBar({ entry, index, count }: ViewerPanelProps) {
  return (
    <Flex gap="space.05" rowGap="space.03" alignItems="center" flexWrap="wrap" flexShrink={0}>
      <BackButton />
      <Box flex="1" minWidth="240px">
        <ScreenMeta entry={entry} index={index} count={count} />
      </Box>
      <StepButtons index={index} count={count} />
      <ViewerToggles hasHistory={entry.scenario.history !== undefined} />
      <styled.p
        width="100%"
        textStyle="caption.01"
        color="ink.text-subdued"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        title={entry.scenario.note}
      >
        {entry.scenario.note}
      </styled.p>
    </Flex>
  );
}

interface StageItem {
  id: string;
  caption: string;
  direction?: ApprovalDirection;
  isHistory?: boolean;
}

interface StageOptions {
  isCompare: boolean;
  showToday: boolean;
  showActivity: boolean;
}

const activityCaption = 'Then in activity';

function toHistoryItem(direction: ApprovalDirection, caption: string): StageItem {
  return { id: `${direction.id}-activity`, caption, direction, isHistory: true };
}

function toStageItems(
  scenario: Scenario,
  selected: ApprovalDirection,
  compared: ApprovalDirection[],
  { isCompare, showToday, showActivity }: StageOptions
): StageItem[] {
  const hasActivity = showActivity && scenario.history !== undefined;
  if (hasActivity && isCompare) {
    return compared.map(direction =>
      toHistoryItem(direction, `${direction.name} · ${activityCaption.toLowerCase()}`)
    );
  }
  const today: StageItem[] =
    showToday && scenario.captureId
      ? [{ id: 'today', caption: 'Today · real capture, 4 Aug 2026' }]
      : [];
  const directions = isCompare ? compared : [selected];
  const histories = hasActivity ? [toHistoryItem(selected, activityCaption)] : [];
  return [
    ...today,
    ...directions.map(direction => ({
      id: direction.id,
      caption: hasActivity ? `${direction.name} · approval` : direction.name,
      direction,
    })),
    ...histories,
  ];
}

interface ViewerStageProps {
  scenario: Scenario;
  selected: ApprovalDirection;
}

function ViewerStage({ scenario, selected }: ViewerStageProps) {
  const { theme, isViewerCompare, showToday, showActivity, update } = useCanvasSettings();
  const stageRef = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(stageRef);
  const compared = useComparedDirections();
  const items = toStageItems(scenario, selected, compared, {
    isCompare: isViewerCompare,
    showToday,
    showActivity,
  });
  const count = items.length;
  const widthScale = (width - stageGap * (count - 1)) / (count * popupWidth);
  const heightScale = (height - captionHeight) / popupHeight;
  const scale = Math.max(
    0.1,
    Math.floor(Math.min(widthScale, heightScale, maxStageScale) * 1000) / 1000
  );
  return (
    <Box ref={stageRef} flex="1" minHeight="0" minWidth="0" position="relative">
      {width > 0 && height > 0 && (
        <Flex justifyContent="center" alignItems="flex-start" style={{ gap: stageGap }}>
          {items.map(item => {
            const direction = item.direction;
            const isSelected = isViewerCompare && direction?.id === selected.id;
            return (
              <Stack key={item.id} gap="0" flexShrink={0} data-viewer-item={item.id}>
                <styled.button
                  type="button"
                  disabled={!direction}
                  onClick={() => {
                    if (direction) update({ direction: direction.id });
                  }}
                  textAlign="left"
                  textStyle="caption.02"
                  color={isSelected ? 'ink.text-primary' : 'ink.text-subdued'}
                  fontWeight={isSelected ? 600 : 400}
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  cursor={direction ? 'pointer' : 'default'}
                  style={{ height: captionHeight, maxWidth: Math.round(popupWidth * scale) }}
                >
                  {item.caption}
                </styled.button>
                {direction ? (
                  <ScenarioFrame
                    key={`${scenario.id}-${item.id}`}
                    scenario={scenario}
                    direction={direction}
                    scale={scale}
                    theme={theme}
                    thumbId={`viewer-${scenario.id}--${item.id}`}
                    isInteractive
                    isSolo={!isViewerCompare && !item.isHistory}
                    isHistory={item.isHistory}
                  />
                ) : (
                  <ScaledCapture captureId={scenario.captureId} scale={scale} isScrollable />
                )}
              </Stack>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}

interface FilmstripProps {
  entry: ViewerEntry;
  direction: ApprovalDirection;
}

function Filmstrip({ entry, direction }: FilmstripProps) {
  const { theme } = useCanvasSettings();
  const { openViewer } = useCanvasNavigation();
  const stripRef = useRef<HTMLDivElement>(null);
  const scenarios = entry.section.scenarios;
  const activeId = entry.scenario.id;

  useEffect(() => {
    const strip = stripRef.current;
    const item = strip?.querySelector(`[data-filmstrip-item="${activeId}"]`);
    if (item instanceof HTMLElement) item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeId]);

  return (
    <Flex
      as="nav"
      aria-label={`${entry.section.label} screens`}
      alignItems="flex-end"
      justifyContent="space-between"
      gap="space.05"
      borderTopWidth={1}
      borderColor="ink.border-default"
      pt="space.03"
      flexShrink={0}
      minWidth="0"
    >
      <Stack gap="0" flexShrink={0} pb="space.01">
        <styled.span textStyle="label.03">{entry.section.label}</styled.span>
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          {scenarios.length} screens
        </styled.span>
      </Stack>
      <Flex
        ref={stripRef}
        className={hiddenScrollbar}
        overflowX="auto"
        gap="space.02"
        minWidth="0"
        py="3px"
        px="3px"
      >
        {scenarios.map((scenario, position) => {
          const isCurrent = scenario.id === activeId;
          return (
            <Box
              key={scenario.id}
              data-filmstrip-item={scenario.id}
              flexShrink={0}
              opacity={isCurrent ? 1 : 0.72}
              _hover={{ opacity: 1 }}
            >
              <ThumbCard
                width={Math.round(popupWidth * filmstripScale)}
                actionLabel={`${position + 1}. ${scenario.label}`}
                title={scenario.label}
                isActive={isCurrent}
                onOpen={() => openViewer(scenario.id)}
              >
                <ScenarioFrame
                  scenario={scenario}
                  direction={direction}
                  scale={filmstripScale}
                  theme={theme}
                  thumbId={`filmstrip-${scenario.id}`}
                />
              </ThumbCard>
            </Box>
          );
        })}
      </Flex>
    </Flex>
  );
}

interface ViewerViewProps {
  sections: CanvasScreenSection[];
}

export function ViewerView({ sections }: ViewerViewProps) {
  const { screen, direction, isViewerCompare } = useCanvasSettings();
  const entries: ViewerEntry[] = sections.flatMap(section =>
    section.scenarios.map(scenario => ({ scenario, section }))
  );
  const foundIndex = entries.findIndex(entry => entry.scenario.id === screen);
  const index = Math.max(0, foundIndex);
  const entry = entries[index];
  const selected = findApprovalDirection(direction);
  if (!entry) return null;
  return (
    <Flex
      direction="column"
      gap="space.03"
      pt="space.04"
      pb="space.03"
      style={{ height: 'calc(100vh - var(--canvas-toolbar-height, 0px))' }}
    >
      <Flex flex="1" minHeight="0" gap="space.06">
        <Stack flex="1" minWidth="0" gap="space.03">
          {isViewerCompare && (
            <ViewerInfoBar
              entry={entry}
              index={index}
              count={entries.length}
              direction={selected}
            />
          )}
          <DirectionTabs />
          <ViewerStage scenario={entry.scenario} selected={selected} />
        </Stack>
        {!isViewerCompare && (
          <ViewerSidePanel
            entry={entry}
            index={index}
            count={entries.length}
            direction={selected}
          />
        )}
      </Flex>
      <Filmstrip entry={entry} direction={selected} />
    </Flex>
  );
}
