import { useLocation } from 'react-router';

import { isObject } from '@leather.io/utils';

interface BackgroundLocation {
  pathname: string;
}

function isBackgroundLocation(value: unknown): value is BackgroundLocation {
  if (!isObject(value) || value === null) return false;
  return 'pathname' in value && typeof value.pathname === 'string';
}

export function useBackgroundLocation(): BackgroundLocation | undefined {
  const location = useLocation();
  const state: unknown = location.state;

  if (!isObject(state) || state === null || !('backgroundLocation' in state)) return undefined;

  const { backgroundLocation } = state;

  if (!isBackgroundLocation(backgroundLocation)) return undefined;

  return backgroundLocation;
}
