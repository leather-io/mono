import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '~/constants/query-client';

import type { LeatherProvider } from '@leather.io/rpc';
import { Tooltip } from '@leather.io/ui';

import { analytics } from './utils/analytics/analytics';
import { useOnRouteChange } from './utils/analytics/use-on-route-change';

declare global {
  interface Window {
    LeatherProvider?: LeatherProvider;
  }
}

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Required async import otherwise Buffer is undefined
    import('~/services/init-app-services')
      .then(({ initAppServices }) => initAppServices())
      // eslint-disable-next-line no-console
      .catch(console.error);
  }, []);

  useOnRouteChange(() => analytics.page());
  useOnRouteChange(
    location => location.pathname === '/' && navigate('/stacking', { replace: true })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider delayDuration={320}>
        <Outlet />
      </Tooltip.Provider>
    </QueryClientProvider>
  );
}
