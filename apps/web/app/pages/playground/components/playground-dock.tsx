import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { ChevronDownIcon } from '@leather.io/ui';

import { type PlaygroundSectionId, playgroundAreas, playgroundSections } from '../playground-areas';
import { playgroundPaths } from '../playground.constants';

// Row treatment shared by every interactive item in the dock panel, so area
// links and utility links read as the same control.
const rowStyles = {
  alignItems: 'center',
  gap: 'space.02',
  px: 'space.03',
  py: 'space.02',
  borderRadius: 'sm',
  _hover: { bg: 'rgba(255, 255, 255, 0.08)' },
} as const;

function DockRowLink({
  to,
  label,
  active,
  onNavigate,
}: {
  to: string;
  label: string;
  active?: boolean;
  onNavigate(): void;
}) {
  return (
    <NavLink to={to} style={{ textDecoration: 'none' }} onClick={onNavigate}>
      <Flex {...rowStyles} bg={active ? 'rgba(255, 255, 255, 0.12)' : 'transparent'}>
        <styled.span
          textStyle="label.02"
          color={active ? 'ink.background-primary' : 'rgba(255, 255, 255, 0.72)'}
        >
          {label}
        </styled.span>
      </Flex>
    </NavLink>
  );
}

function SectionPicker({
  selected,
  onSelect,
}: {
  selected: PlaygroundSectionId;
  onSelect(id: PlaygroundSectionId): void;
}) {
  const [open, setOpen] = useState(false);
  const selectedSection = playgroundSections.find(section => section.id === selected);

  function hasAreas(id: PlaygroundSectionId) {
    return playgroundAreas.some(area => area.section === id);
  }

  return (
    <Box>
      <styled.button
        type="button"
        onClick={() => setOpen(value => !value)}
        cursor="pointer"
        display="flex"
        alignItems="center"
        gap="space.01"
        width="100%"
        px="space.03"
        py="space.02"
        borderRadius="sm"
        _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }}
      >
        <styled.span textStyle="label.02" color="ink.background-primary">
          {selectedSection?.label}
        </styled.span>
        <ChevronDownIcon variant="small" color="ink.background-primary" />
      </styled.button>
      {open ? (
        <Flex
          direction="column"
          gap="space.01"
          mt="space.01"
          p="space.01"
          borderRadius="sm"
          bg="rgba(255, 255, 255, 0.06)"
        >
          {playgroundSections.map(section => {
            const enabled = hasAreas(section.id);
            return (
              <styled.button
                key={section.id}
                type="button"
                disabled={!enabled}
                onClick={() => {
                  onSelect(section.id);
                  setOpen(false);
                }}
                cursor={enabled ? 'pointer' : 'not-allowed'}
                display="flex"
                alignItems="center"
                px="space.03"
                py="space.02"
                borderRadius="sm"
                opacity={enabled ? 1 : 0.4}
                _hover={enabled ? { bg: 'rgba(255, 255, 255, 0.08)' } : {}}
              >
                <styled.span
                  textStyle="label.02"
                  color={
                    section.id === selected ? 'ink.background-primary' : 'rgba(255, 255, 255, 0.72)'
                  }
                >
                  {section.label}
                </styled.span>
              </styled.button>
            );
          })}
        </Flex>
      ) : null}
    </Box>
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

  const [section, setSection] = useState<PlaygroundSectionId>(
    activeArea?.section ?? playgroundSections[0].id
  );

  const sectionAreas = playgroundAreas.filter(area => area.section === section);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Close on any route change, not just the dock's own links — the layout
  // (and this component) stays mounted across client-side navigations.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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
            bg="invert"
            boxShadow="0 8px 32px rgba(0,0,0,0.32)"
          >
            <SectionPicker selected={section} onSelect={setSection} />
            <Box
              borderTopWidth="1px"
              borderTopStyle="solid"
              borderColor="rgba(255, 255, 255, 0.12)"
              my="space.01"
            />
            {sectionAreas.map(area => (
              <DockRowLink
                key={area.slug}
                to={playgroundPaths.area(area.slug)}
                label={area.title}
                active={area.slug === activeArea?.slug}
                onNavigate={() => setOpen(false)}
              />
            ))}
            <DockRowLink
              to={playgroundPaths.index}
              label="All areas"
              onNavigate={() => setOpen(false)}
            />
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
          bg="invert"
          boxShadow="0 4px 16px rgba(0,0,0,0.24)"
          opacity={open ? 1 : 0.85}
          _hover={{ opacity: 1 }}
        >
          <styled.span textStyle="caption.01" color="ink.background-primary">
            {activeArea ? activeArea.title : 'Playground'}
          </styled.span>
        </styled.button>
      </Flex>
    </>
  );
}
