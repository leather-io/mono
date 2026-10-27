// Right-rail content from the area's config: the selected concept (bet, why,
// trade-off, open questions), and "How we got here" (the journey). Canvas-only.
import { HStack, Stack, styled } from 'leather-styles/jsx';

import type { Concept, ConceptLine, JourneyStep } from './exploration-config';
import { ColumnLabel, RailDisclosure, SourceTag } from './section';

function Line({ line }: { line: ConceptLine }) {
  return (
    <styled.p textStyle="body.02" color="ink.text-primary">
      {line.text} <SourceTag>{line.source}</SourceTag>
    </styled.p>
  );
}

function Group({ label, lines }: { label: string; lines: ConceptLine[] }) {
  if (lines.length === 0) return null;
  return (
    <Stack gap="space.01">
      <ColumnLabel>{label}</ColumnLabel>
      {lines.length === 1 ? (
        <Line line={lines[0]} />
      ) : (
        <styled.ul
          listStyleType="disc"
          pl="space.04"
          display="flex"
          flexDir="column"
          gap="space.01"
        >
          {lines.map(line => (
            <styled.li key={line.text}>
              <Line line={line} />
            </styled.li>
          ))}
        </styled.ul>
      )}
    </Stack>
  );
}

export function ConceptDetails({ concept }: { concept: Concept }) {
  return (
    <RailDisclosure
      title="Concept"
      meta={`Built from ${concept.builtFrom.join(' · ')}`}
      defaultOpen
    >
      <Stack gap="space.04">
        <Group label="The bet" lines={[concept.bet]} />
        <Group label="Why" lines={concept.why} />
        <Group label="Trade-off" lines={[concept.tradeOff]} />
        <Group label="Open questions" lines={concept.openQuestions} />
      </Stack>
    </RailDisclosure>
  );
}

export function HowWeGotHere({ journey }: { journey: JourneyStep[] }) {
  if (journey.length === 0) return null;
  return (
    <RailDisclosure title="How we got here" meta={`${journey.length} steps`}>
      <styled.ol display="flex" flexDir="column" gap="space.04">
        {journey.map((step, index) => (
          <styled.li key={step.label}>
            <Stack gap="space.01">
              <HStack gap="space.02" alignItems="baseline">
                <styled.span textStyle="caption.02" color="ink.text-subdued">
                  {index + 1}
                </styled.span>
                <ColumnLabel>{step.label}</ColumnLabel>
              </HStack>
              {step.lines.map(line => (
                <styled.p key={line} textStyle="body.02" color="ink.text-primary" pl="space.04">
                  {line}
                </styled.p>
              ))}
            </Stack>
          </styled.li>
        ))}
      </styled.ol>
    </RailDisclosure>
  );
}
