import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '~/constants/query-client';
import { useDetectLeatherProvider } from '~/store/addresses';

import type { LeatherProvider } from '@leather.io/rpc';
import { Tooltip } from '@leather.io/ui';

import { analytics } from './utils/analytics/analytics';
import { useOnRouteChange } from './utils/analytics/use-on-route-change';

declare global {
  interface Window {
    LeatherProvider?: LeatherProvider;
  }
}

async function importAndInitAppServices() {
  const { initAppServices } = await import('~/services/init-app-services');
  return initAppServices();
}

export default function App() {
  const navigate = useNavigate();

  useDetectLeatherProvider();

  useEffect(() => {
    // Required async import otherwise Buffer is undefined
    importAndInitAppServices()
      // eslint-disable-next-line no-console
      .catch(console.error);
  }, []);

  useOnRouteChange(() => analytics.page());
  useOnRouteChange(location => {
    if (location.pathname === '/') void navigate('/staking', { replace: true });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider delayDuration={320}>
        <Outlet />
      </Tooltip.Provider>
    </QueryClientProvider>
  );
}
