import { useLocation } from 'react-router';

import { isObject } from '@leather.io/utils';

interface BackgroundLocation {
  pathname: string;
}

function isBackgroundLocation(value: unknown): value is BackgroundLocation {
  if (!isObject(value) || value === null) return false;
  return typeof (value as Record<string, unknown>).pathname === 'string';
}

export function useBackgroundLocation(): BackgroundLocation | undefined {
  const location = useLocation();
  const state = location.state;

  if (!isObject(state) || state === null) return undefined;

  const { backgroundLocation } = state as Record<string, unknown>;

  if (!isBackgroundLocation(backgroundLocation)) return undefined;

  return backgroundLocation;
}
