import { useEffect } from 'react';
import { Location, useLocation } from 'react-router';

export function useOnRouteChange(fn: (location: Location<any>) => void) {
  const location = useLocation();

  useEffect(() => {
    fn(location);
  }, [fn, location, location.pathname]);
}
