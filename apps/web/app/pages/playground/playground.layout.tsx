import { NavLink, Outlet, data } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { type PlaygroundArea, playgroundAreas } from './playground-areas';
import { playgroundEnabled, playgroundPaths } from './playground.constants';

// Gate the entire /playground/* area: when disabled (production deploy),
// every route under this layout 404s, even on direct URL entry.
export function loader() {
  if (!playgroundEnabled) throw data('Not found', { status: 404 });
  return null;
}

function AreaNavItem({ area }: { area: PlaygroundArea }) {
  return (
    <NavLink to={playgroundPaths.area(area.slug)} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <Flex
          alignItems="center"
          gap="space.02"
          px="space.03"
          py="space.02"
          borderRadius="sm"
          bg={isActive ? 'ink.background-secondary' : 'transparent'}
          _hover={{ bg: 'ink.background-secondary' }}
        >
          <Box
            width="6px"
            height="6px"
            borderRadius="round"
            flexShrink={0}
            bg={
              area.status === 'living'
                ? 'green.action-primary-default'
                : 'orange.action-primary-default'
            }
          />
          <styled.span
            textStyle="label.02"
            color={isActive ? 'ink.text-primary' : 'ink.text-subdued'}
          >
            {area.title}
          </styled.span>
        </Flex>
      )}
    </NavLink>
  );
}

// Scoped shell for /playground/*: persistent sidebar listing every area, with
// the active area rendering in the outlet. Deliberately minimal chrome — the
// content under review should dominate the screen.
export default function PlaygroundLayout() {
  return (
    <Flex minHeight="100vh" alignItems="stretch">
      <Flex
        as="nav"
        direction="column"
        gap="space.05"
        width="240px"
        flexShrink={0}
        p="space.05"
        borderRightWidth="1px"
        borderRightStyle="solid"
        borderColor="ink.border-transparent"
      >
        <NavLink to={playgroundPaths.index} style={{ textDecoration: 'none' }}>
          <styled.span textStyle="heading.05" color="ink.text-primary">
            Playground
          </styled.span>
        </NavLink>
        <Flex direction="column" gap="space.01">
          {playgroundAreas.map(area => (
            <AreaNavItem key={area.slug} area={area} />
          ))}
        </Flex>
        <styled.span textStyle="caption.01" color="ink.text-subdued" mt="auto">
          Dev, previews & staging only
        </styled.span>
      </Flex>
      <Box flex="1" minWidth={0} p="space.06">
        <Outlet />
      </Box>
    </Flex>
  );
}
