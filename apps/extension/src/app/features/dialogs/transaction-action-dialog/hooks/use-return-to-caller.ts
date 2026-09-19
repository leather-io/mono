import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { useLocationStateWithCache } from '@app/common/hooks/use-location-state';

export function useReturnToCaller() {
  const navigate = useNavigate();
  const returnTo = useLocationStateWithCache<string>('returnTo', RouteUrls.Home);
  return useCallback(() => void navigate(returnTo), [navigate, returnTo]);
}
