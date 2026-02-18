import { useSelector } from 'react-redux';

import type { RootState } from '@app/store';

interface BackgroundLocation {
  pathname: string;
}

export function useBackgroundLocation(): BackgroundLocation | undefined {
  const pathname = useSelector(
    (state: RootState) => state.navigation.modal.backgroundLocationPathname
  );
  if (!pathname) return undefined;
  return { pathname };
}
