import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { aboutAnatomyScenario, aboutZones } from '../approval-flows.about';
import { findApprovalDirection } from '../directions/direction-registry';
import type { Scenario } from '../scenarios/scenario';
import { useCanvasSettings } from './canvas-settings';
import { PopupFrame } from './popup-frame';
import { ScenarioRender } from './scenario-render';

const markerSize = 24;
const markerSettleDelay = 600;

const zoneSelectors = [
  { number: 1, selector: '[data-approval-zone="requester"]' },
  { number: 2, selector: '[data-approval-zone="account"]' },
  { number: 3, selector: '[data-approval-zone="intent"]' },
  { number: 4, selector: '[data-approval-section="What moves"]' },
  { number: 5, selector: '[data-approval-zone="caution"]' },
  { number: 6, selector: '[data-approval-section="Details"]' },
  { number: 7, selector: '[data-approval-zone="footer"]' },
];

interface MarkerPosition {
  number: number;
  top: number;
}

interface ZoneMarkerProps {
  number: number;
  top?: number;
}

function ZoneMarker({ number, top }: ZoneMarkerProps) {
  return (
    <Flex
      position={top === undefined ? 'static' : 'absolute'}
      left={0}
      width="24px"
      height="24px"
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      borderRadius="round"
      bg="ink.action-primary-default"
      color="ink.background-primary"
      textStyle="label.03"
      style={top === undefined ? undefined : { top }}
    >
      {number}
    </Flex>
  );
}

interface AnatomyMarkersProps {
  children: ReactNode;
}

function AnatomyMarkers({ children }: AnatomyMarkersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<MarkerPosition[]>([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      if (!container) return;
      const containerBox = container.getBoundingClientRect();
      const frameBox = container.querySelector('[data-scenario-frame]')?.getBoundingClientRect();
      const next: MarkerPosition[] = [];
      zoneSelectors.forEach(zone => {
        const element = container.querySelector(zone.selector);
        if (!element) return;
        const box = element.getBoundingClientRect();
        const center = box.top + Math.min(box.height, 48) / 2;
        if (frameBox && (center < frameBox.top || center > frameBox.bottom)) return;
        next.push({ number: zone.number, top: center - containerBox.top - markerSize / 2 });
      });
      setMarkers(next);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    const timer = window.setTimeout(measure, markerSettleDelay);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [children]);

  return (
    <Box ref={containerRef} position="relative" pl="space.07" flexShrink={0}>
      {markers.map(marker => (
        <ZoneMarker key={marker.number} number={marker.number} top={marker.top} />
      ))}
      {children}
    </Box>
  );
}

interface AboutAnatomyProps {
  scenarios: Scenario[];
}

export function AboutAnatomy({ scenarios }: AboutAnatomyProps) {
  const {
    theme,
    direction,
    titleStyle,
    networkLabel,
    accountPlacement,
    headerSurface,
    footerEdge,
    replayKey,
  } = useCanvasSettings();
  const scenario = scenarios.find(item => item.id === aboutAnatomyScenario);
  const active = findApprovalDirection(direction);
  if (!scenario) return null;
  return (
    <Flex gap="space.08" rowGap="space.06" flexWrap="wrap" alignItems="flex-start">
      <AnatomyMarkers
        key={`${theme}-${direction}-${titleStyle}-${networkLabel}-${accountPlacement}-${headerSurface}-${footerEdge}-${replayKey}`}
      >
        <Box inert>
          <PopupFrame
            caption={`${scenario.label} · ${active.name}`}
            theme={theme}
            frameId="about-anatomy"
          >
            <ScenarioRender scenario={scenario} direction={active} />
          </PopupFrame>
        </Box>
      </AnatomyMarkers>
      <Stack as="ol" gap="space.05" flex="1" minWidth="260px" maxWidth="420px" pt="space.06">
        {aboutZones.map(zone => (
          <Flex as="li" key={zone.number} gap="space.03" alignItems="flex-start">
            <ZoneMarker number={zone.number} />
            <Stack gap="space.01">
              <styled.span textStyle="label.02">{zone.title}</styled.span>
              <styled.p textStyle="body.02" color="ink.text-subdued">
                {zone.rule}
              </styled.p>
            </Stack>
          </Flex>
        ))}
      </Stack>
    </Flex>
  );
}
