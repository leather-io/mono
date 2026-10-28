import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

import {
  approvalDirections,
  defaultDiscardedDirectionIds,
  findApprovalDirection,
} from '../directions/direction-registry';
import { handshakeDirection } from '../directions/handshake-direction';
import type {
  ApprovalHeaderRadius,
  ApprovalHeaderSurface,
  ApprovalTitleStyle,
} from '../pattern/approval-options';

type CanvasTheme = 'light' | 'dark';
export type CanvasView =
  | 'screens'
  | 'viewer'
  | 'frames'
  | 'about'
  | 'primitives'
  | 'activity'
  | 'journeys';
export type CanvasThumbSize = 's' | 'm' | 'l';
export type CanvasFormFactor = 'extension' | 'phone' | 'small-phone' | 'web';

interface CanvasFrameSize {
  width: number;
  height: number;
}

export const formFactorSizes: Record<CanvasFormFactor, CanvasFrameSize> = {
  extension: { width: 390, height: 756 },
  phone: { width: 390, height: 844 },
  'small-phone': { width: 360, height: 640 },
  web: { width: 560, height: 756 },
};

interface CanvasSettings {
  titleStyle: ApprovalTitleStyle;
  headerSurface: ApprovalHeaderSurface;
  headerRadius: ApprovalHeaderRadius;
  theme: CanvasTheme;
  isCompare: boolean;
  direction: string;
  screen: string | null;
  showToday: boolean;
  view: CanvasView;
  thumbSize: CanvasThumbSize;
  formFactor: CanvasFormFactor;
  isViewerCompare: boolean;
  showActivity: boolean;
  hiddenDirections: string[];
}

interface CanvasSettingsValue extends CanvasSettings {
  replayKey: number;
  discardedDirections: string[];
  update(patch: Partial<CanvasSettings>): void;
  replay(): void;
  setDirectionDiscarded(id: string, isDiscarded: boolean): void;
}

const discardedStorageKey = 'leather.approval-canvas.handshake-focus.discarded';

function readDiscardedDirections() {
  try {
    const stored = window.localStorage.getItem(discardedStorageKey);
    if (stored === null) return defaultDiscardedDirectionIds;
    const known = approvalDirections.map(direction => direction.id);
    return stored.split(',').filter(id => known.includes(id));
  } catch {
    return defaultDiscardedDirectionIds;
  }
}

function writeDiscardedDirections(ids: string[]) {
  try {
    window.localStorage.setItem(discardedStorageKey, ids.join(','));
  } catch {
    return undefined;
  }
  return undefined;
}

const initialCanvasSettings: CanvasSettings = {
  titleStyle: 'current',
  headerSurface: 'divider',
  headerRadius: 'md',
  theme: 'light',
  isCompare: false,
  direction: handshakeDirection.id,
  screen: null,
  showToday: false,
  view: 'screens',
  thumbSize: 'l',
  formFactor: 'extension',
  isViewerCompare: false,
  showActivity: false,
  hiddenDirections: [],
};

export const thumbScales: Record<CanvasThumbSize, number> = {
  s: 0.3,
  m: 0.42,
  l: 0.56,
};

function readTitleStyle(value: string | null): ApprovalTitleStyle {
  if (value === 'proposed') return 'proposed';
  if (value === 'large') return 'large';
  if (value === 'marche') return 'marche';
  return initialCanvasSettings.titleStyle;
}

function readHeaderSurface(value: string | null): ApprovalHeaderSurface {
  if (value === 'plain') return 'plain';
  if (value === 'card') return 'card';
  return initialCanvasSettings.headerSurface;
}

function readHeaderRadius(value: string | null): ApprovalHeaderRadius {
  if (value === 'sm') return 'sm';
  if (value === 'lg') return 'lg';
  if (value === 'xl') return 'xl';
  return initialCanvasSettings.headerRadius;
}

function readView(value: string | null): CanvasView {
  if (value === 'journeys') return 'journeys';
  if (value === 'activity') return 'activity';
  if (value === 'viewer') return 'viewer';
  if (value === 'frames') return 'frames';
  if (value === 'about') return 'about';
  if (value === 'primitives') return 'primitives';
  return initialCanvasSettings.view;
}

function readIsCompare(view: string | null, compare: string | null) {
  if (view === 'matrix') return true;
  if (view === 'overview') return false;
  return compare === 'on';
}

function readShowToday(view: CanvasView, value: string | null) {
  if (view === 'frames') return value === 'show';
  return value === 'show';
}

function serializeToday(settings: CanvasSettings) {
  if (settings.view === 'frames') return settings.showToday ? 'show' : null;
  return settings.showToday ? 'show' : null;
}

function readThumbSize(value: string | null): CanvasThumbSize {
  if (value === 's') return 's';
  if (value === 'm') return 'm';
  if (value === 'l') return 'l';
  return initialCanvasSettings.thumbSize;
}

function readFormFactor(value: string | null): CanvasFormFactor {
  if (value === 'phone') return 'phone';
  if (value === 'small-phone') return 'small-phone';
  if (value === 'web') return 'web';
  return initialCanvasSettings.formFactor;
}

function readHiddenDirections(value: string | null) {
  if (!value) return [];
  const known = approvalDirections.map(direction => direction.id);
  const hidden = value.split(',').filter(id => known.includes(id));
  return hidden.length < known.length ? hidden : [];
}

export function activeDirectionsFor(discarded: string[]) {
  return approvalDirections.filter(direction => !discarded.includes(direction.id));
}

export function useActiveDirections() {
  const { discardedDirections } = useCanvasSettings();
  return activeDirectionsFor(discardedDirections);
}

export function useDiscardedDirections() {
  const { discardedDirections } = useCanvasSettings();
  return approvalDirections.filter(direction => discardedDirections.includes(direction.id));
}

export function useComparedDirections() {
  const { hiddenDirections } = useCanvasSettings();
  return useActiveDirections().filter(direction => !hiddenDirections.includes(direction.id));
}

function readInitialSettings(): CanvasSettings {
  const params = new URLSearchParams(window.location.search);
  const view = readView(params.get('view'));
  return {
    titleStyle: readTitleStyle(params.get('title')),
    headerSurface: readHeaderSurface(params.get('hsurface')),
    headerRadius: readHeaderRadius(params.get('hradius')),
    theme: params.get('theme') === 'dark' ? 'dark' : initialCanvasSettings.theme,
    isCompare: readIsCompare(params.get('view'), params.get('compare')),
    direction: findApprovalDirection(params.get('direction') ?? initialCanvasSettings.direction).id,
    screen: params.get('screen') || null,
    showToday: readShowToday(view, params.get('today')),
    view,
    thumbSize: readThumbSize(params.get('size')),
    formFactor: readFormFactor(params.get('form')),
    isViewerCompare: params.get('vcompare') === 'on',
    showActivity: params.get('activity') === 'on',
    hiddenDirections: readHiddenDirections(params.get('hide')),
  };
}

function withoutDefault<T>(value: T, fallback: T, serialized: string) {
  return value === fallback ? null : serialized;
}

function writeSettingsToUrl(settings: CanvasSettings) {
  const params = new URLSearchParams(window.location.search);
  const entries: [string, string | null][] = [
    ['view', withoutDefault(settings.view, initialCanvasSettings.view, settings.view)],
    [
      'title',
      withoutDefault(settings.titleStyle, initialCanvasSettings.titleStyle, settings.titleStyle),
    ],
    [
      'hsurface',
      withoutDefault(
        settings.headerSurface,
        initialCanvasSettings.headerSurface,
        settings.headerSurface
      ),
    ],
    [
      'hradius',
      withoutDefault(
        settings.headerRadius,
        initialCanvasSettings.headerRadius,
        settings.headerRadius
      ),
    ],
    ['theme', withoutDefault(settings.theme, initialCanvasSettings.theme, settings.theme)],
    ['compare', settings.isCompare ? 'on' : null],
    [
      'direction',
      withoutDefault(settings.direction, initialCanvasSettings.direction, settings.direction),
    ],
    ['screen', settings.screen],
    ['today', serializeToday(settings)],
    [
      'size',
      withoutDefault(settings.thumbSize, initialCanvasSettings.thumbSize, settings.thumbSize),
    ],
    [
      'form',
      withoutDefault(settings.formFactor, initialCanvasSettings.formFactor, settings.formFactor),
    ],
    ['vcompare', settings.isViewerCompare ? 'on' : null],
    ['activity', settings.showActivity ? 'on' : null],
    ['hide', settings.hiddenDirections.length > 0 ? settings.hiddenDirections.join(',') : null],
  ];
  entries.forEach(([key, value]) => {
    if (value === null) params.delete(key);
    else params.set(key, value);
  });
  const search = params.toString();
  const next = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
  if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(window.history.state, '', next);
  }
}

const CanvasSettingsContext = createContext<CanvasSettingsValue>({
  ...initialCanvasSettings,
  replayKey: 0,
  update() {
    return undefined;
  },
  discardedDirections: defaultDiscardedDirectionIds,
  replay() {
    return undefined;
  },
  setDirectionDiscarded() {
    return undefined;
  },
});

interface CanvasSettingsProviderProps {
  children: ReactNode;
}

export function CanvasSettingsProvider({ children }: CanvasSettingsProviderProps) {
  const [settings, setSettings] = useState(readInitialSettings);
  const [replayKey, setReplayKey] = useState(0);
  const [discardedDirections, setDiscardedDirections] = useState(readDiscardedDirections);

  useEffect(() => {
    writeSettingsToUrl(settings);
  }, [settings]);

  return (
    <CanvasSettingsContext.Provider
      value={{
        ...settings,
        replayKey,
        update(patch) {
          setSettings(current => ({ ...current, ...patch }));
        },
        discardedDirections,
        replay() {
          setReplayKey(current => current + 1);
        },
        setDirectionDiscarded(id, isDiscarded) {
          const next = isDiscarded
            ? [...discardedDirections.filter(discardedId => discardedId !== id), id]
            : discardedDirections.filter(discardedId => discardedId !== id);
          const active = activeDirectionsFor(next);
          if (active.length === 0) return;
          setDiscardedDirections(next);
          writeDiscardedDirections(next);
        },
      }}
    >
      {children}
    </CanvasSettingsContext.Provider>
  );
}

export function useCanvasSettings() {
  return useContext(CanvasSettingsContext);
}
