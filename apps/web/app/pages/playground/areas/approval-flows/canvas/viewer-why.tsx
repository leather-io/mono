import { Flex, Stack, styled } from 'leather-styles/jsx';

import { aboutPrinciples, principleAnchorId } from '../approval-flows.about';
import { useCanvasNavigation } from './canvas-navigation';

interface ViewerWhyProps {
  scenarioId: string;
}

export function ViewerWhy({ scenarioId }: ViewerWhyProps) {
  const { openAbout } = useCanvasNavigation();
  const cited = aboutPrinciples.filter(principle => principle.screens.includes(scenarioId));
  if (cited.length === 0) return null;
  return (
    <Stack as="section" aria-label="Why this screen looks like this" gap="space.01">
      <styled.span textStyle="label.03">Why</styled.span>
      <Flex direction="column" gap="2px" alignItems="flex-start">
        {cited.map(principle => (
          <styled.a
            key={principle.id}
            href={`#${principleAnchorId(principle.id)}`}
            onClick={event => {
              event.preventDefault();
              openAbout(principleAnchorId(principle.id));
            }}
            textStyle="caption.01"
            color="ink.text-subdued"
            textDecoration="underline"
            textDecorationColor="ink.border-default"
            textUnderlineOffset="3px"
            _hover={{ color: 'ink.text-primary', textDecorationColor: 'ink.text-primary' }}
          >
            {principle.title} →
          </styled.a>
        ))}
      </Flex>
    </Stack>
  );
}
