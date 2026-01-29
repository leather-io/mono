import { useMemo } from 'react';
import { useLocation } from 'react-router';

export function useHasApprovedOperation() {
  const location = useLocation();

  return useMemo(() => {
    const state = location.state;
    return ((state as any)?.hasApprovedOperation ?? false) as boolean;
  }, [location.state]);
}
