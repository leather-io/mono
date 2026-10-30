import { css } from 'leather-styles/css';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { type Decision, decisions } from '../approval-flows.content';

const everyScreenId = 'pattern';

const decisionItem = css({
  '& > summary': { listStyle: 'none' },
  '& > summary::-webkit-details-marker': { display: 'none' },
  '& [data-chevron]': { transition: 'transform 160ms ease' },
  '&[open] [data-chevron]': { transform: 'rotate(90deg)' },
});

interface DecisionItemProps {
  decision: Decision;
  isInitiallyOpen: boolean;
}

function DecisionItem({ decision, isInitiallyOpen }: DecisionItemProps) {
  const recommended = decision.options.filter(option => option.recommended);
  const others = decision.options.filter(option => !option.recommended);
  return (
    <styled.details
      className={decisionItem}
      open={isInitiallyOpen}
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
        <styled.span>{decision.question}</styled.span>
      </styled.summary>
      <Stack gap="space.03" px="space.03" pb="space.03" pt="space.01">
        <Stack as="ul" gap="space.02">
          {recommended.map(option => (
            <Flex as="li" key={option.label} gap="space.02" alignItems="flex-start">
              <styled.span
                aria-hidden
                flexShrink={0}
                mt="5px"
                width="8px"
                height="8px"
                borderRadius="round"
                bg="ink.action-primary-default"
              />
              <Stack gap="2px">
                <styled.span textStyle="caption.01" color="ink.text-primary">
                  {option.label}
                </styled.span>
                <styled.span textStyle="caption.02" color="ink.text-subdued">
                  Recommended
                </styled.span>
              </Stack>
            </Flex>
          ))}
          {others.map(option => (
            <Flex as="li" key={option.label} gap="space.02" alignItems="flex-start">
              <styled.span
                aria-hidden
                flexShrink={0}
                mt="5px"
                width="8px"
                height="8px"
                borderRadius="round"
                borderWidth={1}
                borderColor="ink.text-subdued"
              />
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {option.label}
              </styled.span>
            </Flex>
          ))}
        </Stack>
        <styled.p
          textStyle="caption.01"
          color="ink.text-subdued"
          borderLeft="default"
          pl="space.02"
        >
          {decision.why}
        </styled.p>
      </Stack>
    </styled.details>
  );
}

interface DecisionGroupProps {
  label: string;
  scenarioId: string;
  items: Decision[];
  isInitiallyOpen: boolean;
}

function DecisionGroup({ label, scenarioId, items, isInitiallyOpen }: DecisionGroupProps) {
  return (
    <Stack gap="space.02">
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {label}
      </styled.span>
      {items.map(decision => (
        <DecisionItem
          key={`${scenarioId}-${decision.id}`}
          decision={decision}
          isInitiallyOpen={isInitiallyOpen}
        />
      ))}
    </Stack>
  );
}

interface ViewerDecisionsProps {
  scenarioId: string;
}

export function ViewerDecisions({ scenarioId }: ViewerDecisionsProps) {
  const screenDecisions = decisions.filter(decision => decision.seeAlso === scenarioId);
  const everyScreenDecisions = decisions.filter(decision => decision.seeAlso === everyScreenId);
  const count = screenDecisions.length + everyScreenDecisions.length;
  if (count === 0) return null;
  return (
    <Stack
      as="section"
      aria-label="Open decisions"
      gap="space.03"
      borderTopWidth={1}
      borderColor="ink.border-default"
      pt="space.04"
    >
      <Flex alignItems="baseline" justifyContent="space-between">
        <styled.span textStyle="label.03">Open decisions</styled.span>
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          {count}
        </styled.span>
      </Flex>
      {screenDecisions.length > 0 && (
        <DecisionGroup
          label="On this screen"
          scenarioId={scenarioId}
          items={screenDecisions}
          isInitiallyOpen
        />
      )}
      {everyScreenDecisions.length > 0 && (
        <DecisionGroup
          label="Applies to every screen"
          scenarioId={scenarioId}
          items={everyScreenDecisions}
          isInitiallyOpen={false}
        />
      )}
    </Stack>
  );
}
