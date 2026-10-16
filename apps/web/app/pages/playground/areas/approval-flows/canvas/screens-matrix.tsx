import { useRef } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import type { ApprovalDirection } from '../pattern/approval-direction';
import type { Scenario } from '../scenarios/scenario';
import { canvasTargetId, useCanvasNavigation } from './canvas-navigation';
import { useCanvasSettings, useComparedDirections } from './canvas-settings';
import { ScaledCapture, ScenarioFrame, popupWidth } from './scaled-frame';
import type { CanvasScreenSection } from './screen-sections';
import { ThumbCard } from './thumb-card';
import { useElementSize } from './use-element-size';

const cellGap = 12;
const minScale = 0.12;
const maxScale = 0.6;
const wideLabelWidth = 200;
const mediumLabelWidth = 164;
const narrowLabelWidth = 132;
const narrowBreakpoint = 900;
const mediumBreakpoint = 1100;
const todayColumnId = 'today';

interface MatrixColumn {
  id: string;
  name: string;
  description: string;
  direction?: ApprovalDirection;
}

function toColumns(directions: ApprovalDirection[], showToday: boolean): MatrixColumn[] {
  const directionColumns = directions.map(direction => ({
    id: direction.id,
    name: direction.name,
    description: direction.description,
    direction,
  }));
  if (!showToday) return directionColumns;
  return [
    {
      id: todayColumnId,
      name: 'Today',
      description: 'Real capture of the extension, 4 Aug 2026',
    },
    ...directionColumns,
  ];
}

function labelWidthFor(width: number) {
  if (width < narrowBreakpoint) return narrowLabelWidth;
  if (width < mediumBreakpoint) return mediumLabelWidth;
  return wideLabelWidth;
}

function computeScale(width: number, labelWidth: number, columnCount: number) {
  const available = width - labelWidth - cellGap * columnCount;
  const scale = available / columnCount / popupWidth;
  return Math.min(maxScale, Math.max(minScale, Math.floor(scale * 1000) / 1000));
}

interface MatrixLayout {
  columns: MatrixColumn[];
  scale: number;
  cellWidth: number;
  labelWidth: number;
}

interface MatrixHeaderProps {
  layout: MatrixLayout;
}

function MatrixHeader({ layout }: MatrixHeaderProps) {
  const { setCompare } = useCanvasNavigation();
  return (
    <Flex
      data-canvas-sticky
      alignItems="flex-end"
      position="sticky"
      zIndex={6}
      bg="ink.background-primary"
      borderBottomWidth={1}
      borderColor="ink.border-default"
      pt="space.02"
      style={{ top: 'var(--canvas-toolbar-height, 0px)', gap: cellGap }}
    >
      <Box
        position="sticky"
        left="0"
        flexShrink={0}
        bg="ink.background-primary"
        pb="space.02"
        style={{ width: layout.labelWidth }}
      >
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          Screen
        </styled.span>
      </Box>
      {layout.columns.map(column => {
        const directionId = column.direction?.id;
        if (!directionId) {
          return (
            <styled.span
              key={column.id}
              title={column.description}
              flexShrink={0}
              textStyle="label.03"
              color="ink.text-subdued"
              textAlign="center"
              borderBottomWidth={2}
              borderColor="transparent"
              pb="space.02"
              mb="-1px"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              style={{ width: layout.cellWidth }}
            >
              {column.name}
            </styled.span>
          );
        }
        return (
          <styled.button
            key={column.id}
            type="button"
            title={`${column.description} Click to see only ${column.name}.`}
            aria-label={`See only ${column.name}`}
            onClick={() => setCompare(false, { direction: directionId })}
            flexShrink={0}
            textAlign="center"
            textStyle="label.03"
            color="ink.text-primary"
            borderBottomWidth={2}
            borderColor="transparent"
            pb="space.02"
            mb="-1px"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            cursor="pointer"
            _hover={{ borderColor: 'ink.text-primary' }}
            style={{ width: layout.cellWidth }}
          >
            {column.name}
          </styled.button>
        );
      })}
    </Flex>
  );
}

interface MatrixRowProps {
  scenario: Scenario;
  layout: MatrixLayout;
  isActive: boolean;
}

function MatrixRow({ scenario, layout, isActive }: MatrixRowProps) {
  const { theme } = useCanvasSettings();
  const { openViewer } = useCanvasNavigation();
  return (
    <Flex
      id={canvasTargetId('screens', scenario.id)}
      alignItems="flex-start"
      style={{ gap: cellGap }}
    >
      <Stack
        position="sticky"
        left="0"
        zIndex={2}
        flexShrink={0}
        gap="space.01"
        bg="ink.background-primary"
        pr="space.02"
        style={{ width: layout.labelWidth }}
      >
        <styled.button
          type="button"
          onClick={() => openViewer(scenario.id)}
          textAlign="left"
          textStyle="label.03"
          color={isActive ? 'ink.text-primary' : 'ink.text-subdued'}
          cursor="pointer"
          _hover={{ color: 'ink.text-primary', textDecoration: 'underline' }}
        >
          {scenario.label}
        </styled.button>
        <styled.code textStyle="caption.02" color="ink.text-subdued" wordBreak="break-all">
          {scenario.method}
        </styled.code>
      </Stack>
      {layout.columns.map(column => {
        const direction = column.direction;
        if (!direction) {
          return (
            <ThumbCard
              key={column.id}
              width={layout.cellWidth}
              actionLabel={`Open ${scenario.label} with today’s capture`}
              title={`${scenario.label} · Today`}
              onOpen={() => openViewer(scenario.id, { showToday: true })}
            >
              <ScaledCapture captureId={scenario.captureId} scale={layout.scale} />
            </ThumbCard>
          );
        }
        return (
          <ThumbCard
            key={column.id}
            width={layout.cellWidth}
            actionLabel={`Open ${scenario.label} in ${direction.name}`}
            title={`${scenario.label} · ${direction.name}`}
            onOpen={() => openViewer(scenario.id, { direction: direction.id })}
          >
            <ScenarioFrame
              scenario={scenario}
              direction={direction}
              scale={layout.scale}
              theme={theme}
              thumbId={`matrix-${scenario.id}--${direction.id}`}
              isLazy
            />
          </ThumbCard>
        );
      })}
    </Flex>
  );
}

interface ScreensMatrixProps {
  sections: CanvasScreenSection[];
}

export function ScreensMatrix({ sections }: ScreensMatrixProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(containerRef);
  const { showToday } = useCanvasSettings();
  const { activeId } = useCanvasNavigation();
  const directions = useComparedDirections();
  const columns = toColumns(directions, showToday);
  const labelWidth = labelWidthFor(width);
  const scale = computeScale(width, labelWidth, columns.length);
  const layout: MatrixLayout = {
    columns,
    scale,
    cellWidth: Math.round(popupWidth * scale),
    labelWidth,
  };
  return (
    <Box ref={containerRef} width="100%" pt="space.03" pb="space.11">
      {width > 0 && (
        <>
          <MatrixHeader layout={layout} />
          <Stack gap="space.07" pt="space.05">
            {sections.map(section => (
              <Stack
                key={section.id}
                id={canvasTargetId('screens', section.id)}
                as="section"
                aria-label={section.label}
                gap="space.05"
              >
                <Flex
                  alignItems="baseline"
                  gap="space.03"
                  borderBottomWidth={1}
                  borderColor="ink.border-default"
                  pb="space.02"
                >
                  <styled.h2 textStyle="label.02">{section.label}</styled.h2>
                  <styled.span textStyle="caption.02" color="ink.text-subdued">
                    {section.scenarios.length}
                  </styled.span>
                </Flex>
                {section.scenarios.map(scenario => (
                  <MatrixRow
                    key={scenario.id}
                    scenario={scenario}
                    layout={layout}
                    isActive={scenario.id === activeId}
                  />
                ))}
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
