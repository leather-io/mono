import { type ReactNode, memo, useRef } from 'react';

import { css } from 'leather-styles/css';
import { Box, styled } from 'leather-styles/jsx';

import type { ApprovalDirection } from '../pattern/approval-direction';
import type { Scenario } from '../scenarios/scenario';
import { getCaptureUrl } from './capture-frame';
import { useNearViewport } from './lazy-mount';
import { ScenarioRender } from './scenario-render';

export const popupWidth = 390;
export const popupHeight = 756;

const hiddenScrollbar = css({
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
});

function scaledSize(scale: number) {
  return { width: Math.round(popupWidth * scale), height: Math.round(popupHeight * scale) };
}

interface ScaledFrameProps {
  scale: number;
  theme: 'light' | 'dark';
  thumbId: string;
  isInteractive?: boolean;
  isLazy?: boolean;
  children: ReactNode;
}

function ScaledFrame({
  scale,
  theme,
  thumbId,
  isInteractive = false,
  isLazy = false,
  children,
}: ScaledFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isNear = useNearViewport(ref, isLazy);
  return (
    <Box
      ref={ref}
      data-thumb-surface
      position="relative"
      flexShrink={0}
      overflow="hidden"
      contain="strict"
      borderRadius="sm"
      outline="1px solid"
      outlineColor="ink.border-default"
      bg="ink.background-secondary"
      style={scaledSize(scale)}
    >
      {isNear && (
        <Box
          data-thumb-frame={thumbId}
          className={theme === 'dark' ? 'dark' : undefined}
          aria-hidden={isInteractive ? undefined : true}
          inert={!isInteractive}
          position="absolute"
          top="0"
          left="0"
          width="popupWidth"
          height="popupHeight"
          overflow="hidden"
          bg="ink.background-primary"
          transformOrigin="top left"
          pointerEvents={isInteractive ? 'auto' : 'none'}
          style={{ transform: `scale(${scale})` }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}

interface ScenarioFrameProps {
  scenario: Scenario;
  direction: ApprovalDirection;
  scale: number;
  theme: 'light' | 'dark';
  thumbId: string;
  isInteractive?: boolean;
  isLazy?: boolean;
  isSolo?: boolean;
  isHistory?: boolean;
}

function ScenarioFrameContent({
  scenario,
  direction,
  scale,
  theme,
  thumbId,
  isInteractive,
  isLazy,
  isSolo,
  isHistory,
}: ScenarioFrameProps) {
  return (
    <ScaledFrame
      scale={scale}
      theme={theme}
      thumbId={thumbId}
      isInteractive={isInteractive}
      isLazy={isLazy}
    >
      <ScenarioRender
        scenario={scenario}
        direction={direction}
        isSolo={isSolo}
        isHistory={isHistory}
      />
    </ScaledFrame>
  );
}

export const ScenarioFrame = memo(ScenarioFrameContent);

interface ScaledCaptureProps {
  captureId?: string;
  scale: number;
  isScrollable?: boolean;
}

export function ScaledCapture({ captureId, scale, isScrollable = false }: ScaledCaptureProps) {
  const url = captureId ? getCaptureUrl(captureId) : undefined;
  return (
    <Box
      data-thumb-surface
      position="relative"
      flexShrink={0}
      overflowY={isScrollable ? 'auto' : 'hidden'}
      overflowX="hidden"
      className={hiddenScrollbar}
      borderRadius="sm"
      outline="1px solid"
      outlineColor="ink.border-default"
      bg="ink.background-secondary"
      pointerEvents={isScrollable ? 'auto' : 'none'}
      style={scaledSize(scale)}
    >
      {url ? (
        <styled.img
          src={url}
          alt=""
          loading="lazy"
          draggable={false}
          display="block"
          width="100%"
        />
      ) : (
        <styled.span
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          p="space.02"
          textAlign="center"
          textStyle="caption.02"
          color="ink.text-subdued"
        >
          No capture
        </styled.span>
      )}
    </Box>
  );
}
