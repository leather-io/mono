import { useSearchParams } from 'react-router';

import { type FrameSizeId, type ThemeId, frameSizeIds, themeIds } from './frame';

// The Today entry when it shows today's real extension (screenshots, not a
// redraw). Reserved: no area may use it as a variant id.
const todayActualId = 'actual';

export interface ExplorationParams<V extends string, S extends string> {
  overview: boolean;
  // The selected concept. Kept while Overview or Today's screenshots are
  // shown, so switching back returns to it.
  variant: V;
  screen: S;
  actual: boolean;
  step: string | null;
  theme: ThemeId;
  frame: FrameSizeId;
  sheet: boolean;
  compare: boolean;
}

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.find(item => item === value) ?? fallback;
}

interface UseExplorationParamsArgs<V extends string, S extends string> {
  variantIds: readonly V[];
  screenIds: readonly S[];
  defaultVariant: V;
  defaultScreen: S;
}

export function useExplorationParams<V extends string, S extends string>({
  variantIds,
  screenIds,
  defaultVariant,
  defaultScreen,
}: UseExplorationParamsArgs<V, S>) {
  const [searchParams, setSearchParams] = useSearchParams();

  function read(query: URLSearchParams): ExplorationParams<V, S> {
    const v = query.get('v');
    const remembered = v === null || v === todayActualId;
    return {
      overview: v === null,
      variant: pick(remembered ? query.get('from') : v, variantIds, defaultVariant),
      screen: pick(query.get('screen'), screenIds, defaultScreen),
      actual: v === todayActualId,
      step: query.get('step'),
      theme: pick(query.get('theme'), themeIds, 'light'),
      frame: pick(query.get('frame'), frameSizeIds, 'popup'),
      sheet: query.get('sheet') === '1',
      compare: query.get('compare') === '1',
    };
  }

  const params = read(searchParams);

  // Functional, so several updates before a re-render (fast keys, a click
  // that navigates and resets) each build on the last.
  function update(next: Partial<ExplorationParams<V, S>>) {
    setSearchParams(
      previous => {
        const merged = { ...read(previous), ...next };
        const query = new URLSearchParams(previous);
        query.delete('notes');
        query.delete('step');
        if (merged.overview) {
          query.delete('v');
          query.set('from', merged.variant);
        } else if (merged.actual) {
          query.set('v', todayActualId);
          query.set('from', merged.variant);
          if (merged.step) query.set('step', merged.step);
        } else {
          query.set('v', merged.variant);
          query.delete('from');
        }
        query.set('screen', merged.screen);
        query.set('theme', merged.theme);
        query.set('frame', merged.frame);
        if (merged.sheet && !merged.overview) query.set('sheet', '1');
        else query.delete('sheet');
        if (merged.compare) query.set('compare', '1');
        else query.delete('compare');
        return query;
      },
      { replace: true, preventScrollReset: true }
    );
  }

  return { params, update };
}
