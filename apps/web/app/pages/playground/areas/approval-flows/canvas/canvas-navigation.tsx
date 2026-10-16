import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ChevronsRightIcon } from '@leather.io/ui';

import { approvalDirections, findApprovalDirection } from '../directions/direction-registry';
import {
  type CanvasThumbSize,
  type CanvasView,
  activeDirectionsFor,
  useCanvasSettings,
} from './canvas-settings';
import { Kbd } from './kbd';

interface CanvasNavItem {
  id: string;
  label: string;
  method?: string;
}

export interface CanvasNavGroup {
  id: string;
  label: string;
  targetId?: string;
  items: CanvasNavItem[];
}

type JumpMode = 'restore' | 'return' | 'smooth';

interface PendingJump {
  targetId: string;
  mode: JumpMode;
  count: number;
}

interface ViewerPatch {
  direction?: string;
  showToday?: boolean;
}

interface CompareOptions {
  direction?: string;
}

interface CanvasNavigationValue {
  groups: CanvasNavGroup[];
  filteredGroups: CanvasNavGroup[];
  query: string;
  activeId: string | null;
  viewerOrigin: string | null;
  isShortcutsOpen: boolean;
  isIssuesOpen: boolean;
  isRailCollapsed: boolean;
  setQuery(value: string): void;
  setShortcutsOpen(isOpen: boolean): void;
  setIssuesOpen(isOpen: boolean): void;
  setRailCollapsed(isCollapsed: boolean): void;
  jumpTo(id: string): void;
  jumpToFirstMatch(): void;
  move(delta: number): void;
  setView(view: CanvasView): void;
  setCompare(isCompare: boolean, options?: CompareOptions): void;
  openViewer(id: string, patch?: ViewerPatch, origin?: string): void;
  closeViewer(): void;
  openAbout(anchorId?: string): void;
  scrollToAnchor(anchorId: string): void;
}

const railCollapsedStorageKey = 'leather.approval-canvas.rail-collapsed';

function readRailCollapsed() {
  try {
    return window.localStorage.getItem(railCollapsedStorageKey) === 'true';
  } catch {
    return false;
  }
}

function writeRailCollapsed(isCollapsed: boolean) {
  try {
    window.localStorage.setItem(railCollapsedStorageKey, String(isCollapsed));
  } catch {
    return undefined;
  }
  return undefined;
}

const flashDuration = 1400;
const scrollLockDuration = 1200;
const stickyGap = 24;
const settleDelay = 500;

const CanvasNavigationContext = createContext<CanvasNavigationValue>({
  groups: [],
  filteredGroups: [],
  query: '',
  activeId: null,
  viewerOrigin: null,
  isShortcutsOpen: false,
  isIssuesOpen: false,
  isRailCollapsed: false,
  setQuery() {
    return undefined;
  },
  setShortcutsOpen() {
    return undefined;
  },
  setIssuesOpen() {
    return undefined;
  },
  setRailCollapsed() {
    return undefined;
  },
  jumpTo() {
    return undefined;
  },
  jumpToFirstMatch() {
    return undefined;
  },
  move() {
    return undefined;
  },
  setView() {
    return undefined;
  },
  setCompare() {
    return undefined;
  },
  openViewer() {
    return undefined;
  },
  closeViewer() {
    return undefined;
  },
  openAbout() {
    return undefined;
  },
  scrollToAnchor() {
    return undefined;
  },
});

export function canvasTargetId(view: CanvasView, id: string) {
  if (view === 'screens') return `screens-${id}`;
  return id;
}

function matchesQuery(item: CanvasNavItem, query: string) {
  return [item.label, item.id, item.method ?? ''].some(value =>
    value.toLowerCase().includes(query)
  );
}

function filterGroups(groups: CanvasNavGroup[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return groups;
  return groups
    .map(group =>
      group.label.toLowerCase().includes(normalized)
        ? group
        : { ...group, items: group.items.filter(item => matchesQuery(item, normalized)) }
    )
    .filter(group => group.items.length > 0);
}

function getStickyOffset() {
  return Array.from(document.querySelectorAll('[data-canvas-sticky]')).reduce(
    (total, element) => total + element.getBoundingClientRect().height,
    0
  );
}

function getExtraOffset(element: HTMLElement) {
  const extra = Number(element.getAttribute('data-scroll-extra'));
  return Number.isFinite(extra) ? extra : 0;
}

function replaceHash(id: string | null) {
  const hash = id ? `#${id}` : '';
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}${hash}`
  );
}

function scrollToTarget(id: string, behavior: ScrollBehavior) {
  const element = document.getElementById(id);
  if (!element) return false;
  const top =
    element.getBoundingClientRect().top +
    window.scrollY -
    getStickyOffset() -
    getExtraOffset(element) -
    stickyGap;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

function flashTarget(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  element.setAttribute('data-canvas-flash', 'true');
  window.setTimeout(() => element.removeAttribute('data-canvas-flash'), flashDuration);
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

function isControlTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('button, a, summary, [role="button"]'));
}

function focusVisibleSearch() {
  const fields = Array.from(document.querySelectorAll('[data-canvas-search]'));
  const visible = fields.find(
    field => field instanceof HTMLInputElement && field.getClientRects().length > 0
  );
  if (visible instanceof HTMLInputElement) {
    visible.focus();
    visible.select();
  }
}

function readHashTarget() {
  const hash = window.location.hash.replace('#', '');
  return hash ? decodeURIComponent(hash) : null;
}

function readInitialJump(view: CanvasView): PendingJump | null {
  const target = readHashTarget();
  if (!target || view !== 'screens') return null;
  return { targetId: canvasTargetId(view, target), mode: 'restore', count: 0 };
}

const thumbSizeOrder: CanvasThumbSize[] = ['s', 'm', 'l'];
const directionKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface CanvasNavigationProviderProps {
  groups: CanvasNavGroup[];
  children: ReactNode;
}

export function CanvasNavigationProvider({ groups, children }: CanvasNavigationProviderProps) {
  const {
    screen,
    isCompare,
    direction,
    view,
    thumbSize,
    showToday,
    isViewerCompare,
    showActivity,
    discardedDirections,
    update,
    replay,
  } = useCanvasSettings();
  const [query, setQuery] = useState('');
  const [isShortcutsOpen, setShortcutsOpenState] = useState(false);
  const [isIssuesOpen, setIssuesOpenState] = useState(false);
  const [isRailCollapsed, setRailCollapsedState] = useState(false);
  const [observedId, setObservedId] = useState<string | null>(readHashTarget);
  const [pendingJump, setPendingJump] = useState<PendingJump | null>(() => readInitialJump(view));
  const [viewerOrigin, setViewerOrigin] = useState<string | null>(null);
  const lockUntil = useRef(0);
  const activeRef = useRef<string | null>(null);

  const items = useMemo(() => groups.flatMap(group => group.items), [groups]);

  useEffect(() => {
    setRailCollapsedState(readRailCollapsed());
  }, []);

  const setShortcutsOpen = useCallback((isOpen: boolean) => {
    setShortcutsOpenState(isOpen);
    if (isOpen) setIssuesOpenState(false);
  }, []);

  const setIssuesOpen = useCallback((isOpen: boolean) => {
    setIssuesOpenState(isOpen);
    if (isOpen) setShortcutsOpenState(false);
  }, []);

  const setRailCollapsed = useCallback((isCollapsed: boolean) => {
    setRailCollapsedState(isCollapsed);
    writeRailCollapsed(isCollapsed);
  }, []);
  const order = useMemo(() => items.map(item => item.id), [items]);
  const isScreenKnown = Boolean(screen && order.includes(screen));
  const isScreenMode = view !== 'screens';
  const filteredGroups = useMemo(() => filterGroups(groups, query), [groups, query]);
  const activeId = view === 'viewer' ? screen : observedId;

  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (view !== 'viewer' || isScreenKnown) return;
    const fallback = observedId && order.includes(observedId) ? observedId : order[0];
    if (fallback) update({ screen: fallback });
  }, [isScreenKnown, observedId, order, update, view]);

  const requestJump = useCallback((targetId: string, mode: JumpMode) => {
    setPendingJump(current => ({ targetId, mode, count: (current?.count ?? 0) + 1 }));
  }, []);

  useEffect(() => {
    if (!pendingJump) return;
    const { targetId, mode } = pendingJump;
    const behavior: ScrollBehavior = mode === 'smooth' ? 'smooth' : 'auto';
    lockUntil.current = Date.now() + scrollLockDuration;
    const frame = window.requestAnimationFrame(() => {
      if (!scrollToTarget(targetId, behavior)) {
        if (mode !== 'smooth') window.scrollTo({ top: 0 });
        return;
      }
      if (mode !== 'restore') flashTarget(targetId);
    });
    const settle =
      mode === 'smooth'
        ? undefined
        : window.setTimeout(() => scrollToTarget(targetId, 'auto'), settleDelay);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [pendingJump]);

  useEffect(() => {
    if (isScreenMode) return;
    const intersecting = new Set<string>();
    const idsByTarget = new Map(order.map(id => [canvasTargetId(view, id), id]));
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const id = idsByTarget.get(entry.target.id);
          if (!id) return;
          if (entry.isIntersecting) intersecting.add(id);
          else intersecting.delete(id);
        });
        if (Date.now() < lockUntil.current) return;
        const visible = order.filter(id => intersecting.has(id));
        if (visible.length === 0) return;
        const current = activeRef.current;
        const next = current && visible.includes(current) ? current : visible[0];
        if (next) setObservedId(next);
      },
      { rootMargin: '-20% 0px -65% 0px' }
    );
    idsByTarget.forEach((_id, targetId) => {
      const element = document.getElementById(targetId);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [order, isScreenMode, isCompare, view, thumbSize, showToday]);

  const jumpTo = useCallback(
    (id: string) => {
      if (view === 'viewer') {
        if (order.includes(id)) update({ screen: id });
        return;
      }
      setObservedId(id);
      requestJump(canvasTargetId('screens', id), 'smooth');
    },
    [order, requestJump, update, view]
  );

  const openViewer = useCallback(
    (id: string, patch?: ViewerPatch, origin?: string) => {
      setObservedId(id);
      setViewerOrigin(origin ?? null);
      replaceHash(null);
      update({ ...patch, view: 'viewer', screen: id });
      window.scrollTo({ top: 0 });
    },
    [update]
  );

  const openAbout = useCallback(
    (anchorId?: string) => {
      setViewerOrigin(null);
      replaceHash(null);
      update({ view: 'about', screen: null });
      if (anchorId) requestJump(anchorId, 'return');
      else window.scrollTo({ top: 0 });
    },
    [requestJump, update]
  );

  const scrollToAnchor = useCallback(
    (anchorId: string) => requestJump(anchorId, 'smooth'),
    [requestJump]
  );

  const closeViewer = useCallback(() => {
    if (viewerOrigin) {
      setViewerOrigin(null);
      update({ view: 'about', screen: null });
      requestJump(viewerOrigin, 'restore');
      return;
    }
    const id = screen;
    update({ view: 'screens', screen: null });
    if (!id) return;
    setObservedId(id);
    requestJump(canvasTargetId('screens', id), 'return');
  }, [requestJump, screen, update, viewerOrigin]);

  const setView = useCallback(
    (next: CanvasView) => {
      if (next === view) return;
      if (next === 'viewer') {
        const target = activeId && order.includes(activeId) ? activeId : order[0];
        if (target) openViewer(target);
        return;
      }
      if (next === 'about') {
        openAbout();
        return;
      }
      if (next === 'primitives' || view === 'primitives' || view === 'about') {
        replaceHash(null);
        update({ view: next });
        window.scrollTo({ top: 0 });
        return;
      }
      closeViewer();
    },
    [activeId, closeViewer, openAbout, openViewer, order, update, view]
  );

  const setCompare = useCallback(
    (next: boolean, options?: CompareOptions) => {
      const anchor = activeRef.current;
      update({ ...options, isCompare: next });
      if (!anchor || window.scrollY === 0) return;
      requestJump(canvasTargetId('screens', anchor), 'restore');
    },
    [requestJump, update]
  );

  const jumpToFirstMatch = useCallback(() => {
    const first = filteredGroups[0]?.items[0];
    if (first) jumpTo(first.id);
  }, [filteredGroups, jumpTo]);

  const findPosition = useCallback(
    (id: string | null) => {
      if (!id) return -1;
      const index = order.indexOf(id);
      if (index >= 0) return index;
      const firstItem = groups.find(group => group.targetId === id)?.items[0];
      return firstItem ? order.indexOf(firstItem.id) - 0.5 : -1;
    },
    [groups, order]
  );

  const move = useCallback(
    (delta: number) => {
      const candidates = query.trim() ? filteredGroups.flatMap(group => group.items) : items;
      const position = findPosition(activeId);
      const next =
        delta > 0
          ? candidates.find(item => order.indexOf(item.id) > position)
          : [...candidates].reverse().find(item => order.indexOf(item.id) < position);
      if (next) jumpTo(next.id);
    },
    [activeId, filteredGroups, findPosition, items, jumpTo, order, query]
  );

  useEffect(() => {
    const activeDirections = activeDirectionsFor(discardedDirections);

    function cycleDirection(delta: number) {
      const index = activeDirections.findIndex(
        item => item.id === findApprovalDirection(direction).id
      );
      const count = activeDirections.length;
      const next = activeDirections[(index + delta + count) % count];
      if (next) update({ direction: next.id });
    }

    function stepThumbSize(delta: number) {
      const index = thumbSizeOrder.indexOf(thumbSize);
      const next = thumbSizeOrder[Math.min(thumbSizeOrder.length - 1, Math.max(0, index + delta))];
      if (next) update({ thumbSize: next });
    }

    function onKeyDown(event: KeyboardEvent) {
      if (view === 'frames' || view === 'primitives') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      const key = event.key;
      if (key === '?') {
        event.preventDefault();
        setShortcutsOpen(!isShortcutsOpen);
        return;
      }
      if (key === 'i') {
        event.preventDefault();
        setIssuesOpen(!isIssuesOpen);
        return;
      }
      if (key === '/') {
        event.preventDefault();
        focusVisibleSearch();
        return;
      }
      if (key === '\\') {
        event.preventDefault();
        setRailCollapsed(!isRailCollapsed);
        return;
      }
      if (view === 'about') {
        if (key === 'r') replay();
        if (key === ']') cycleDirection(1);
        if (key === '[') cycleDirection(-1);
        const aboutDirection = activeDirections[directionKeys.indexOf(key)];
        if (aboutDirection) update({ direction: aboutDirection.id });
        return;
      }
      if (key === 'j') move(1);
      if (key === 'k') move(-1);
      if (key === 'r') replay();
      const isMatrix = view === 'screens' && isCompare;
      if (!isMatrix) {
        if (key === ']') cycleDirection(1);
        if (key === '[') cycleDirection(-1);
        const directionIndex = directionKeys.indexOf(key);
        const pickedDirection = activeDirections[directionIndex];
        if (directionIndex >= 0 && pickedDirection) update({ direction: pickedDirection.id });
      }
      if (view === 'viewer') {
        if (key === 'ArrowRight' || key === 'ArrowLeft') {
          event.preventDefault();
          move(key === 'ArrowRight' ? 1 : -1);
        }
        if (key === 'c') update({ isViewerCompare: !isViewerCompare });
        if (key === 't') update({ showToday: !showToday });
        if (key === 'a') update({ showActivity: !showActivity });
        if (key === 'Escape') closeViewer();
        return;
      }
      if (key === 'c') setCompare(!isCompare);
      if (isMatrix && key === 't') update({ showToday: !showToday });
      if (!isMatrix) {
        if (key === '-') stepThumbSize(-1);
        if (key === '=' || key === '+') stepThumbSize(1);
      }
      if (key === 'Enter' && !isControlTarget(event.target)) {
        const id = activeRef.current;
        if (id && order.includes(id)) {
          event.preventDefault();
          openViewer(id);
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    closeViewer,
    direction,
    discardedDirections,
    isCompare,
    isIssuesOpen,
    isRailCollapsed,
    isShortcutsOpen,
    isViewerCompare,
    move,
    openViewer,
    order,
    replay,
    setCompare,
    setIssuesOpen,
    setRailCollapsed,
    setShortcutsOpen,
    showActivity,
    showToday,
    thumbSize,
    update,
    view,
  ]);

  return (
    <CanvasNavigationContext.Provider
      value={{
        groups,
        filteredGroups,
        query,
        activeId,
        viewerOrigin,
        isShortcutsOpen,
        isIssuesOpen,
        isRailCollapsed,
        setQuery,
        setShortcutsOpen,
        setIssuesOpen,
        setRailCollapsed,
        jumpTo,
        jumpToFirstMatch,
        move,
        setView,
        setCompare,
        openViewer,
        closeViewer,
        openAbout,
        scrollToAnchor,
      }}
    >
      {children}
      {view !== 'frames' && <ShortcutsPanel />}
    </CanvasNavigationContext.Provider>
  );
}

export function useCanvasNavigation() {
  return useContext(CanvasNavigationContext);
}

function CanvasSearchField() {
  const { query, setQuery, jumpToFirstMatch } = useCanvasNavigation();
  return (
    <Box position="relative" flex="1" minWidth="0">
      <styled.input
        data-canvas-search
        type="search"
        value={query}
        placeholder="Search screens"
        aria-label="Search screens by label, id or method"
        onChange={event => setQuery(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            jumpToFirstMatch();
          }
          if (event.key === 'Escape') {
            setQuery('');
            event.currentTarget.blur();
          }
        }}
        width="100%"
        textStyle="label.03"
        color="ink.text-primary"
        bg="ink.background-primary"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="sm"
        px="space.03"
        py="space.02"
        _placeholder={{ color: 'ink.text-subdued' }}
        _focus={{ outline: 'none', borderColor: 'ink.text-primary' }}
      />
    </Box>
  );
}

interface RailLinkProps {
  id: string;
  isActive: boolean;
  onSelect?(): void;
  children: ReactNode;
}

export function RailLink({ id, isActive, onSelect, children }: RailLinkProps) {
  const { jumpTo } = useCanvasNavigation();
  return (
    <styled.a
      href={`#${id}`}
      data-rail-item={id}
      aria-current={isActive ? 'location' : undefined}
      onClick={event => {
        event.preventDefault();
        if (event.detail > 0) event.currentTarget.blur();
        if (onSelect) onSelect();
        else jumpTo(id);
      }}
      display="flex"
      flexDirection="column"
      gap="1px"
      px="space.03"
      py="space.01"
      borderRadius="xs"
      borderLeftWidth={2}
      borderColor={isActive ? 'ink.text-primary' : 'transparent'}
      bg={isActive ? 'ink.component-background-hover' : 'transparent'}
      color={isActive ? 'ink.text-primary' : 'ink.text-subdued'}
      _hover={{ color: 'ink.text-primary', bg: 'ink.component-background-hover' }}
    >
      {children}
    </styled.a>
  );
}

function RailList() {
  const { filteredGroups, activeId, query, jumpTo } = useCanvasNavigation();
  const isSearching = Boolean(query.trim());
  if (filteredGroups.length === 0) {
    return (
      <styled.p px="space.03" textStyle="caption.01" color="ink.text-subdued">
        No screens match “{query.trim()}”.
      </styled.p>
    );
  }
  return (
    <Stack gap="space.05">
      {filteredGroups.map(group => {
        const screenCount = group.items.length;
        const targetId = group.targetId;
        return (
          <Stack key={group.id} gap="1px">
            <Flex alignItems="baseline" justifyContent="space-between" px="space.03" pb="space.01">
              {targetId ? (
                <styled.a
                  href={`#${targetId}`}
                  onClick={event => {
                    event.preventDefault();
                    if (event.detail > 0) event.currentTarget.blur();
                    jumpTo(targetId);
                  }}
                  textStyle="label.03"
                  color="ink.text-primary"
                  textDecoration={activeId === targetId ? 'underline' : 'none'}
                  textUnderlineOffset="3px"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {group.label}
                </styled.a>
              ) : (
                <styled.span textStyle="label.03" color="ink.text-primary">
                  {group.label}
                </styled.span>
              )}
              {screenCount > 0 && (
                <styled.span textStyle="caption.02" color="ink.text-subdued">
                  {screenCount}
                </styled.span>
              )}
            </Flex>
            {group.items.map(item => (
              <RailLink key={item.id} id={item.id} isActive={item.id === activeId}>
                <styled.span textStyle="caption.01" color="inherit">
                  {item.label}
                </styled.span>
                {isSearching && item.method && (
                  <styled.code textStyle="caption.02" color="ink.text-subdued">
                    {item.method}
                  </styled.code>
                )}
              </RailLink>
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
}

type ShortcutMode = 'grid' | 'matrix' | 'viewer' | 'about';

type ShortcutGroupId = 'navigate' | 'directions' | 'view' | 'launch';

interface Shortcut {
  keys: string[];
  label: string;
  group: ShortcutGroupId;
  modes: ShortcutMode[];
}

interface ShortcutGroup {
  id: ShortcutGroupId;
  label: string;
}

const allModes: ShortcutMode[] = ['grid', 'matrix', 'viewer', 'about'];
const screenModes: ShortcutMode[] = ['grid', 'matrix', 'viewer'];

const shortcutGroups: ShortcutGroup[] = [
  { id: 'navigate', label: 'Navigate' },
  { id: 'directions', label: 'Directions' },
  { id: 'view', label: 'View' },
  { id: 'launch', label: 'Launch' },
];

const shortcuts: Shortcut[] = [
  { keys: ['/'], label: 'Search screens', group: 'navigate', modes: screenModes },
  { keys: ['j', 'k'], label: 'Next, previous screen', group: 'navigate', modes: screenModes },
  { keys: ['j', 'k'], label: 'Next, previous section', group: 'navigate', modes: ['about'] },
  { keys: ['←', '→'], label: 'Previous, next screen', group: 'navigate', modes: ['viewer'] },
  { keys: ['↵'], label: 'Open in viewer', group: 'navigate', modes: ['grid', 'matrix'] },
  { keys: ['Esc'], label: 'Back to screens', group: 'navigate', modes: ['viewer'] },
  { keys: ['?'], label: 'Show or hide shortcuts', group: 'navigate', modes: allModes },
  { keys: ['i'], label: 'Show or hide issues', group: 'navigate', modes: allModes },
  { keys: ['\\'], label: 'Show or hide the sidebar', group: 'navigate', modes: allModes },
  {
    keys: ['[', ']'],
    label: 'Previous, next direction',
    group: 'directions',
    modes: ['grid', 'viewer', 'about'],
  },
  {
    keys: [`1–${approvalDirections.length}`],
    label: 'Pick a direction by number',
    group: 'directions',
    modes: ['grid', 'viewer', 'about'],
  },
  { keys: ['c'], label: 'Compare directions', group: 'view', modes: screenModes },
  { keys: ['t'], label: 'Today’s real capture', group: 'view', modes: ['matrix', 'viewer'] },
  { keys: ['a'], label: 'Then in activity', group: 'view', modes: ['viewer'] },
  { keys: ['-', '='], label: 'Smaller, larger thumbnails', group: 'view', modes: ['grid'] },
  { keys: ['r'], label: 'Replay the launch', group: 'launch', modes: allModes },
];

const shortcutModeLabels: Record<ShortcutMode, string> = {
  grid: 'Screens',
  matrix: 'Screens, compared',
  viewer: 'Viewer',
  about: 'About',
};

function useShortcutMode(): ShortcutMode {
  const { view, isCompare } = useCanvasSettings();
  if (view === 'viewer') return 'viewer';
  if (view === 'about') return 'about';
  return isCompare ? 'matrix' : 'grid';
}

const shortcutsTriggerSelector = '[data-shortcuts-trigger]';

function ShortcutsPanel() {
  const { isShortcutsOpen, setShortcutsOpen } = useCanvasNavigation();
  const mode = useShortcutMode();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isShortcutsOpen) return;
    const previous = document.activeElement;
    panelRef.current?.focus();
    function onPointerDown(event: PointerEvent) {
      const panel = panelRef.current;
      const target = event.target;
      if (!panel || !(target instanceof Element)) return;
      if (panel.contains(target) || target.closest(shortcutsTriggerSelector)) return;
      setShortcutsOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setShortcutsOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [isShortcutsOpen, setShortcutsOpen]);

  if (!isShortcutsOpen) return null;
  const visible = shortcuts.filter(shortcut => shortcut.modes.includes(mode));
  const groups = shortcutGroups
    .map(group => ({ ...group, items: visible.filter(shortcut => shortcut.group === group.id) }))
    .filter(group => group.items.length > 0);

  return (
    <Stack
      ref={panelRef}
      role="dialog"
      aria-label="Keyboard shortcuts"
      tabIndex={-1}
      data-shortcuts-panel
      position="fixed"
      zIndex={40}
      left="space.04"
      right={{ base: 'space.04', lg: 'auto' }}
      width={{ base: 'auto', lg: '320px' }}
      top={{ base: 'calc(var(--canvas-toolbar-height, 0px) + 8px)', lg: 'auto' }}
      bottom={{ base: 'auto', lg: '60px' }}
      maxHeight={{
        base: 'calc(100vh - var(--canvas-toolbar-height, 0px) - 24px)',
        lg: 'calc(100vh - 84px)',
      }}
      overflowY="auto"
      gap="space.04"
      p="space.04"
      bg="ink.background-primary"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="sm"
      boxShadow="0 12px 32px rgba(18, 16, 15, 0.14)"
      _focus={{ outline: 'none' }}
    >
      <Flex alignItems="flex-start" justifyContent="space-between" gap="space.03">
        <Stack gap="0">
          <styled.span textStyle="label.02" color="ink.text-primary">
            Shortcuts
          </styled.span>
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            {shortcutModeLabels[mode]} view
          </styled.span>
        </Stack>
        <styled.button
          type="button"
          onClick={() => setShortcutsOpen(false)}
          display="flex"
          alignItems="center"
          gap="space.02"
          textStyle="caption.01"
          color="ink.text-primary"
          px="space.02"
          py="2px"
          borderWidth={1}
          borderColor="ink.border-default"
          borderRadius="round"
          bg="ink.background-primary"
          cursor="pointer"
          _hover={{ borderColor: 'ink.text-primary' }}
        >
          Close <Kbd>Esc</Kbd>
        </styled.button>
      </Flex>
      {groups.map(group => (
        <Stack key={group.id} gap="space.02">
          <styled.span textStyle="label.03" color="ink.text-primary">
            {group.label}
          </styled.span>
          <Stack as="dl" gap="space.01">
            {group.items.map(shortcut => (
              <Flex key={shortcut.label} alignItems="center" gap="space.03">
                <Flex as="dt" gap="2px" minWidth="56px" flexShrink={0}>
                  {shortcut.keys.map(key => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </Flex>
                <styled.dd textStyle="caption.01" color="ink.text-primary">
                  {shortcut.label}
                </styled.dd>
              </Flex>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

interface ShortcutsButtonProps {
  isCompact?: boolean;
}

function ShortcutsButton({ isCompact = false }: ShortcutsButtonProps) {
  const { isShortcutsOpen, setShortcutsOpen } = useCanvasNavigation();
  return (
    <styled.button
      type="button"
      data-shortcuts-trigger
      aria-expanded={isShortcutsOpen}
      aria-haspopup="dialog"
      title="Keyboard shortcuts"
      onClick={() => setShortcutsOpen(!isShortcutsOpen)}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="space.02"
      flexShrink={0}
      width={isCompact ? 'auto' : '100%'}
      textStyle="label.03"
      color={isShortcutsOpen ? 'ink.text-primary' : 'ink.text-subdued'}
      px="space.03"
      py="space.02"
      borderWidth={1}
      borderColor={isShortcutsOpen ? 'ink.text-primary' : 'ink.border-default'}
      borderRadius="sm"
      bg="ink.background-primary"
      cursor="pointer"
      _hover={{ color: 'ink.text-primary', borderColor: 'ink.text-primary' }}
    >
      Shortcuts <Kbd>?</Kbd>
    </styled.button>
  );
}

interface IssuesButtonProps {
  isCompact?: boolean;
}

function IssuesButton({ isCompact = false }: IssuesButtonProps) {
  const { isIssuesOpen, setIssuesOpen } = useCanvasNavigation();
  return (
    <styled.button
      type="button"
      data-issues-trigger
      aria-expanded={isIssuesOpen}
      aria-haspopup="dialog"
      title="Issues this proposal addresses"
      onClick={() => setIssuesOpen(!isIssuesOpen)}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="space.02"
      flexShrink={0}
      width={isCompact ? 'auto' : '100%'}
      textStyle="label.03"
      color={isIssuesOpen ? 'ink.text-primary' : 'ink.text-subdued'}
      px="space.03"
      py="space.02"
      borderWidth={1}
      borderColor={isIssuesOpen ? 'ink.text-primary' : 'ink.border-default'}
      borderRadius="sm"
      bg="ink.background-primary"
      cursor="pointer"
      _hover={{ color: 'ink.text-primary', borderColor: 'ink.text-primary' }}
    >
      Issues <Kbd>i</Kbd>
    </styled.button>
  );
}

interface RailToggleProps {
  isCollapsed: boolean;
  onToggle(): void;
}

function RailToggle({ isCollapsed, onToggle }: RailToggleProps) {
  const label = isCollapsed ? 'Show sidebar' : 'Hide sidebar';
  return (
    <styled.button
      type="button"
      aria-label={label}
      aria-expanded={!isCollapsed}
      title={`${label} (\\)`}
      onClick={onToggle}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      width="28px"
      height="28px"
      borderRadius="sm"
      color="ink.text-subdued"
      cursor="pointer"
      _hover={{ color: 'ink.text-primary', bg: 'ink.component-background-hover' }}
    >
      <Box lineHeight={0} transform={isCollapsed ? undefined : 'rotate(180deg)'}>
        <ChevronsRightIcon variant="small" color="ink.text-subdued" />
      </Box>
    </styled.button>
  );
}

interface CanvasRailProps {
  label?: string;
  summary?: string;
  activeItemId?: string | null;
  children?: ReactNode;
}

export function CanvasRail({
  label = 'Screens',
  summary,
  activeItemId,
  children,
}: CanvasRailProps) {
  const { activeId, groups, isRailCollapsed, setRailCollapsed } = useCanvasNavigation();
  const listRef = useRef<HTMLDivElement>(null);
  const screenCount = groups.flatMap(group => group.items).length;
  const scrolledId = activeItemId === undefined ? activeId : activeItemId;

  useEffect(() => {
    const list = listRef.current;
    if (!list || !scrolledId) return;
    const item = list.querySelector(`[data-rail-item="${scrolledId}"]`);
    if (!(item instanceof HTMLElement)) return;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    const margin = 48;
    if (itemTop < list.scrollTop + margin) list.scrollTop = Math.max(0, itemTop - margin);
    else if (itemBottom > list.scrollTop + list.clientHeight - margin) {
      list.scrollTop = itemBottom - list.clientHeight + margin;
    }
  }, [scrolledId]);

  if (isRailCollapsed) {
    return (
      <Flex
        as="nav"
        aria-label={label}
        display={{ base: 'none', lg: 'flex' }}
        flexDirection="column"
        alignItems="center"
        position="sticky"
        top={0}
        height="100vh"
        width="48px"
        flexShrink={0}
        pt="space.04"
        borderRightWidth={1}
        borderColor="ink.border-default"
        bg="ink.background-secondary"
      >
        <RailToggle isCollapsed onToggle={() => setRailCollapsed(false)} />
      </Flex>
    );
  }

  return (
    <Flex
      as="nav"
      aria-label={label}
      display={{ base: 'none', lg: 'flex' }}
      flexDirection="column"
      position="sticky"
      top={0}
      height="100vh"
      width="264px"
      flexShrink={0}
      borderRightWidth={1}
      borderColor="ink.border-default"
      bg="ink.background-secondary"
    >
      <Stack gap="space.03" px="space.04" pt="space.04" pb="space.03">
        <Flex alignItems="center" justifyContent="space-between" gap="space.02">
          <Flex alignItems="baseline" gap="space.02" minWidth={0}>
            <styled.span textStyle="label.02">{label}</styled.span>
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              {summary ?? `${screenCount} total`}
            </styled.span>
          </Flex>
          <RailToggle isCollapsed={false} onToggle={() => setRailCollapsed(true)} />
        </Flex>
        {!children && <CanvasSearchField />}
      </Stack>
      <Box ref={listRef} position="relative" flex="1" overflowY="auto" px="space.02" pb="space.05">
        {children ?? <RailList />}
      </Box>
      <Flex
        gap="space.02"
        px="space.04"
        py="space.03"
        borderTopWidth={1}
        borderColor="ink.border-default"
      >
        <Box flex="1" minWidth="0">
          <IssuesButton />
        </Box>
        <Box flex="1" minWidth="0">
          <ShortcutsButton />
        </Box>
      </Flex>
    </Flex>
  );
}

interface CanvasNarrowNavigationProps {
  picker?: ReactNode;
}

export function CanvasNarrowNavigation({ picker }: CanvasNarrowNavigationProps) {
  const { filteredGroups, activeId, jumpTo } = useCanvasNavigation();
  if (picker) {
    return (
      <Flex display={{ base: 'flex', lg: 'none' }} gap="space.03" alignItems="center">
        {picker}
        <IssuesButton isCompact />
        <Box display={{ base: 'none', md: 'block' }} flexShrink={0}>
          <ShortcutsButton isCompact />
        </Box>
      </Flex>
    );
  }
  return (
    <Flex display={{ base: 'flex', lg: 'none' }} gap="space.03" alignItems="center">
      <CanvasSearchField />
      <styled.select
        aria-label="Jump to a screen"
        value={activeId ?? ''}
        onChange={event => {
          if (event.target.value) jumpTo(event.target.value);
        }}
        textStyle="label.03"
        color="ink.text-primary"
        bg="ink.background-primary"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="sm"
        px="space.02"
        py="space.02"
        maxWidth="50%"
      >
        <option value="">Jump to a screen</option>
        {filteredGroups.map(group => (
          <optgroup key={group.id} label={group.label}>
            {group.items.map(item => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </optgroup>
        ))}
      </styled.select>
      <IssuesButton isCompact />
      <Box display={{ base: 'none', md: 'block' }} flexShrink={0}>
        <ShortcutsButton isCompact />
      </Box>
    </Flex>
  );
}
