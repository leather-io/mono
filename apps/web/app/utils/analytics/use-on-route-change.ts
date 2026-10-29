import { useEffect } from 'react';
import { type Location, useLocation } from 'react-router';

export function useOnRouteChange(fn: (location: Location<unknown>) => void) {
  const location = useLocation();

  useEffect(() => {
    fn(location);
  }, [fn, location, location.pathname]);
}
