import { useMemo } from 'react';

import get from 'lodash.get';

import { useLocation } from '@app/routes/compat';

export function useHasApprovedOperation() {
  const location = useLocation();

  return useMemo(() => {
    const state = location.state;
    return get(state, 'hasApprovedOperation', false) as boolean;
  }, [location.state]);
}
