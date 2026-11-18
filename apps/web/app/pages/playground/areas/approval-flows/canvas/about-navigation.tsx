import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Stack, styled } from 'leather-styles/jsx';

import { aboutAnchorId, aboutSections } from '../approval-flows.about';
import { CanvasRail, RailLink, useCanvasNavigation } from './canvas-navigation';
import { useCanvasSettings } from './canvas-settings';

const observerLockDuration = 1200;
const firstSectionId = aboutSections[0]?.id ?? '';

interface AboutNavigationValue {
  activeSectionId: string;
  jumpToSection(sectionId: string): void;
  observeSection(sectionId: string): void;
}

const AboutNavigationContext = createContext<AboutNavigationValue>({
  activeSectionId: firstSectionId,
  jumpToSection() {
    return undefined;
  },
  observeSection() {
    return undefined;
  },
});

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

function writeHash(anchorId: string) {
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}#${anchorId}`
  );
}

interface AboutNavigationProviderProps {
  children: ReactNode;
}

export function AboutNavigationProvider({ children }: AboutNavigationProviderProps) {
  const { view } = useCanvasSettings();
  const { scrollToAnchor } = useCanvasNavigation();
  const [activeSectionId, setActiveSectionId] = useState(firstSectionId);
  const lockUntil = useRef(0);

  const jumpToSection = useCallback(
    (sectionId: string) => {
      lockUntil.current = Date.now() + observerLockDuration;
      setActiveSectionId(sectionId);
      const anchorId = aboutAnchorId(sectionId);
      writeHash(anchorId);
      scrollToAnchor(anchorId);
    },
    [scrollToAnchor]
  );

  const observeSection = useCallback((sectionId: string) => {
    if (Date.now() < lockUntil.current) return;
    setActiveSectionId(sectionId);
  }, []);

  useEffect(() => {
    if (view !== 'about') return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.key !== 'j' && event.key !== 'k') return;
      const index = aboutSections.findIndex(section => section.id === activeSectionId);
      const next = aboutSections[index + (event.key === 'j' ? 1 : -1)];
      if (next) jumpToSection(next.id);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeSectionId, jumpToSection, view]);

  return (
    <AboutNavigationContext.Provider value={{ activeSectionId, jumpToSection, observeSection }}>
      {children}
    </AboutNavigationContext.Provider>
  );
}

export function useAboutNavigation() {
  return useContext(AboutNavigationContext);
}

export function useAboutSectionObserver() {
  const { observeSection } = useAboutNavigation();
  useEffect(() => {
    const visible = new Set<string>();
    const idsByAnchor = new Map(
      aboutSections.map(section => [aboutAnchorId(section.id), section.id])
    );
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const id = idsByAnchor.get(entry.target.id);
          if (!id) return;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        });
        const first = aboutSections.find(section => visible.has(section.id));
        if (first) observeSection(first.id);
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    idsByAnchor.forEach((_id, anchorId) => {
      const element = document.getElementById(anchorId);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [observeSection]);
}

export function AboutRail() {
  const { activeSectionId, jumpToSection } = useAboutNavigation();
  return (
    <CanvasRail
      label="About"
      summary={`${aboutSections.length} sections`}
      activeItemId={aboutAnchorId(activeSectionId)}
    >
      <Stack gap="1px" pt="space.01">
        {aboutSections.map((section, index) => (
          <RailLink
            key={section.id}
            id={aboutAnchorId(section.id)}
            isActive={section.id === activeSectionId}
            onSelect={() => jumpToSection(section.id)}
          >
            <styled.span textStyle="caption.01" color="inherit">
              <styled.span color="ink.text-subdued" mr="space.02">
                {String(index + 1).padStart(2, '0')}
              </styled.span>
              {section.label}
            </styled.span>
          </RailLink>
        ))}
      </Stack>
    </CanvasRail>
  );
}

export function AboutSectionPicker() {
  const { activeSectionId, jumpToSection } = useAboutNavigation();
  return (
    <styled.select
      aria-label="Jump to a section"
      value={activeSectionId}
      onChange={event => jumpToSection(event.target.value)}
      flex="1"
      minWidth="0"
      textStyle="label.03"
      color="ink.text-primary"
      bg="ink.background-primary"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="sm"
      px="space.02"
      py="space.02"
    >
      {aboutSections.map(section => (
        <option key={section.id} value={section.id}>
          {section.label}
        </option>
      ))}
    </styled.select>
  );
}
