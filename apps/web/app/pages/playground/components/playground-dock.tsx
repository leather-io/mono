import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { type PlaygroundArea, playgroundAreas } from '../playground-areas';
import { playgroundPaths } from '../playground.constants';

function StatusDot({ status }: { status: PlaygroundArea['status'] }) {
  return (
    <Box
      width="6px"
      height="6px"
      borderRadius="round"
      flexShrink={0}
      bg={status === 'living' ? 'green.action-primary-default' : 'orange.action-primary-default'}
    />
  );
}

function AreaLink({ area, onNavigate }: { area: PlaygroundArea; onNavigate(): void }) {
  return (
    <NavLink
      to={playgroundPaths.area(area.slug)}
      style={{ textDecoration: 'none' }}
      onClick={onNavigate}
    >
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
          <StatusDot status={area.status} />
          <styled.span
            textStyle="label.02"
            color={isActive ? 'ink.text-primary' : 'ink.text-subdued'}
          >
            {area.title}
          </styled.span>
          {area.issue ? (
            <styled.span textStyle="caption.01" color="ink.text-subdued" ml="auto">
              #{area.issue}
            </styled.span>
          ) : null}
        </Flex>
      )}
    </NavLink>
  );
}

// The playground's only chrome: a small floating pill, bottom-center, that
// expands into an overlay with area navigation. Kept deliberately subtle so
// the canvas — which may be a full app surface — stays in focus.
export function PlaygroundDock() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const activeArea = playgroundAreas.find(
    area => playgroundPaths.area(area.slug) === location.pathname
  );

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      {open ? (
        <Box position="fixed" inset={0} zIndex={1300} onClick={() => setOpen(false)} />
      ) : null}
      <Flex
        position="fixed"
        bottom="space.05"
        left="50%"
        transform="translateX(-50%)"
        zIndex={1400}
        direction="column"
        alignItems="center"
        gap="space.02"
      >
        {open ? (
          <Flex
            direction="column"
            gap="space.01"
            width="300px"
            maxHeight="60vh"
            overflowY="auto"
            p="space.02"
            borderRadius="md"
            bg="ink.background-primary"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="ink.border-transparent"
            boxShadow="0 8px 32px rgba(0,0,0,0.16)"
          >
            {playgroundAreas.map(area => (
              <AreaLink key={area.slug} area={area} onNavigate={() => setOpen(false)} />
            ))}
            <Box
              borderTopWidth="1px"
              borderTopStyle="solid"
              borderColor="ink.border-transparent"
              my="space.01"
            />
            <NavLink
              to={playgroundPaths.index}
              style={{ textDecoration: 'none' }}
              onClick={() => setOpen(false)}
            >
              <Flex
                px="space.03"
                py="space.02"
                borderRadius="sm"
                _hover={{ bg: 'ink.background-secondary' }}
              >
                <styled.span textStyle="label.03" color="ink.text-subdued">
                  All areas
                </styled.span>
              </Flex>
            </NavLink>
            <styled.span
              textStyle="caption.01"
              color="ink.text-subdued"
              px="space.03"
              pb="space.01"
            >
              Dev, previews &amp; staging only
            </styled.span>
          </Flex>
        ) : null}
        <styled.button
          type="button"
          onClick={() => setOpen(value => !value)}
          cursor="pointer"
          display="flex"
          alignItems="center"
          gap="space.02"
          px="space.03"
          py="space.02"
          borderRadius="round"
          bg="ink.background-primary"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="ink.border-transparent"
          boxShadow="0 4px 16px rgba(0,0,0,0.12)"
          opacity={open ? 1 : 0.75}
          _hover={{ opacity: 1 }}
        >
          {activeArea ? <StatusDot status={activeArea.status} /> : null}
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {activeArea ? activeArea.title : 'Playground'}
          </styled.span>
        </styled.button>
      </Flex>
    </>
  );
}
