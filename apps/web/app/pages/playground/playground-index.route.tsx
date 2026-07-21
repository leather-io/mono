import { Link } from 'react-router';

import { Flex, Grid, styled } from 'leather-styles/jsx';

import { type PlaygroundArea, playgroundAreas } from './playground-areas';
import { playgroundPaths } from './playground.constants';

function AreaCard({ area }: { area: PlaygroundArea }) {
  return (
    <Link to={playgroundPaths.area(area.slug)} style={{ textDecoration: 'none' }}>
      <Flex
        direction="column"
        gap="space.02"
        p="space.05"
        height="100%"
        borderRadius="md"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="ink.border-transparent"
        _hover={{ bg: 'ink.background-secondary' }}
      >
        <Flex alignItems="center" gap="space.02">
          <styled.span textStyle="label.01" color="ink.text-primary">
            {area.title}
          </styled.span>
          {area.issue ? (
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              #{area.issue}
            </styled.span>
          ) : null}
        </Flex>
        <styled.span textStyle="body.02" color="ink.text-subdued">
          {area.description}
        </styled.span>
        <styled.span
          textStyle="caption.01"
          mt="auto"
          color={
            area.status === 'living'
              ? 'green.action-primary-default'
              : 'orange.action-primary-default'
          }
        >
          {area.status}
        </styled.span>
      </Flex>
    </Link>
  );
}

export default function PlaygroundIndexRoute() {
  return (
    <Flex direction="column" gap="space.05" maxWidth="1120px" p="space.06">
      <styled.h1 textStyle="heading.04" color="ink.text-primary">
        Playground areas
      </styled.h1>
      <Grid
        gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
        gap="space.04"
      >
        {playgroundAreas.map(area => (
          <AreaCard key={area.slug} area={area} />
        ))}
      </Grid>
    </Flex>
  );
}
