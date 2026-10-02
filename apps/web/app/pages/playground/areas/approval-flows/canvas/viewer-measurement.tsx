import { css } from 'leather-styles/css';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import {
  type ApprovalEvent,
  approvalCommonProperties,
  approvalEventSpecs,
  approvalNeverSent,
  eventProperties,
} from '../approval-flows.events';

const specItem = css({
  '& > summary': { listStyle: 'none' },
  '& > summary::-webkit-details-marker': { display: 'none' },
  '& [data-chevron]': { transition: 'transform 160ms ease' },
  '&[open] [data-chevron]': { transform: 'rotate(90deg)' },
});

interface EventLineProps {
  event: ApprovalEvent;
}

function EventLine({ event }: EventLineProps) {
  const properties = eventProperties(event);
  return (
    <Stack as="li" gap="2px" px="space.03" py="space.02">
      <styled.code textStyle="caption.01" color="ink.text-primary">
        {event.name}
      </styled.code>
      {properties.length > 0 && (
        <styled.span textStyle="caption.02" color="ink.text-subdued" overflowWrap="anywhere">
          {properties.map(([key, value]) => `${key}: ${String(value)}`).join(' · ')}
        </styled.span>
      )}
    </Stack>
  );
}

export function EventSpec() {
  return (
    <styled.details
      className={specItem}
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="sm"
      bg="ink.background-primary"
    >
      <styled.summary
        display="flex"
        alignItems="flex-start"
        gap="space.02"
        px="space.03"
        py="space.02"
        cursor="pointer"
        textStyle="label.03"
        color="ink.text-primary"
        _hover={{ bg: 'ink.component-background-hover' }}
      >
        <styled.span data-chevron aria-hidden color="ink.text-subdued" flexShrink={0}>
          ›
        </styled.span>
        <styled.span>The event spec</styled.span>
      </styled.summary>
      <Stack gap="space.03" px="space.03" pb="space.03" pt="space.01">
        {approvalEventSpecs.map(spec => (
          <Stack key={spec.name} gap="2px">
            <styled.code textStyle="caption.01" color="ink.text-primary">
              {spec.name}
            </styled.code>
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              {spec.when}
            </styled.span>
            {spec.properties.map(property => (
              <styled.span key={property.name} textStyle="caption.02" color="ink.text-subdued">
                <styled.code textStyle="caption.02" color="ink.text-primary">
                  {property.name}
                </styled.code>{' '}
                {property.values}
              </styled.span>
            ))}
          </Stack>
        ))}
        <Stack gap="2px">
          <styled.span textStyle="caption.01" color="ink.text-primary">
            On every event
          </styled.span>
          {approvalCommonProperties.map(property => (
            <styled.span key={property.name} textStyle="caption.02" color="ink.text-subdued">
              <styled.code textStyle="caption.02" color="ink.text-primary">
                {property.name}
              </styled.code>{' '}
              {property.values}
            </styled.span>
          ))}
        </Stack>
        <Stack
          gap="2px"
          textStyle="caption.02"
          color="ink.text-subdued"
          borderLeft="default"
          pl="space.02"
        >
          <styled.span color="ink.text-primary">Never sent</styled.span>
          {approvalNeverSent.map(item => (
            <styled.span key={item}>{item}</styled.span>
          ))}
        </Stack>
      </Stack>
    </styled.details>
  );
}

interface ViewerMeasurementProps {
  events?: ApprovalEvent[];
  directionId: string;
}

export function ViewerMeasurement({ events, directionId }: ViewerMeasurementProps) {
  return (
    <Stack
      as="section"
      aria-label="Measured by"
      gap="space.03"
      borderTopWidth={1}
      borderColor="ink.border-default"
      pt="space.04"
    >
      <Flex alignItems="baseline" justifyContent="space-between">
        <styled.span textStyle="label.03">Measured by</styled.span>
        {events && (
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            {events.length}
          </styled.span>
        )}
      </Flex>
      {events ? (
        <Stack gap="space.02">
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Events this screen sends, with example values
          </styled.span>
          <Stack
            as="ol"
            gap="0"
            borderWidth={1}
            borderColor="ink.border-default"
            borderRadius="sm"
            bg="ink.background-primary"
            css={{ '& > li + li': { borderTopWidth: 1, borderColor: 'ink.border-default' } }}
          >
            {events.map((event, index) => (
              <EventLine key={`${event.name}-${index}`} event={event} />
            ))}
          </Stack>
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Each also sends directionId: {directionId}, requestId and platform.
          </styled.span>
        </Stack>
      ) : (
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          No example events for this screen yet. The spec covers it.
        </styled.span>
      )}
      <EventSpec />
    </Stack>
  );
}
