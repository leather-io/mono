// We need to import the polyfills before any other import
import './utils/polyfills';

import { Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigate } from 'react-router';

import { QueryClientProvider } from '@tanstack/react-query';
import { Flex, styled } from 'leather-styles/jsx';
import { queryClient } from '~/constants/query-client';

import type { LeatherProvider } from '@leather.io/rpc';
import { HasChildren, Tooltip } from '@leather.io/ui';

import { defaultMetaTags } from './constants/meta-tags';
import { InstallDialog } from './features/install-dialog/install-dialog';
import { MockLeatherDialog } from './features/mock-dialog/mock-dialog';
import { Footer } from './layouts/footer/footer';
import { GlobalLoader } from './layouts/nav/global-loader';
import { Nav } from './layouts/nav/nav';
import { initAppServices } from './services/init-app-services';
import { analytics } from './utils/analytics/analytics';
import { useOnRouteChange } from './utils/analytics/use-on-route-change';

initAppServices();

declare global {
  interface Window {
    LeatherProvider?: LeatherProvider;
  }
}

export function Layout({ children }: HasChildren) {
  return (
    <html lang="en">
      <head>
        {defaultMetaTags.map((meta, i) => (
          <meta key={'meta' + i} {...meta} />
        ))}
        <Meta />
        <Links />
      </head>
      <styled.body>
        <GlobalLoader />
        <Nav />
        <Flex flexDir="column" marginLeft={[null, null, 'navbar']} minHeight="100vh">
          <styled.main flex={1} bg="ink.background-primary">
            {children}
          </styled.main>
          <Footer />
        </Flex>
        <InstallDialog />
        <MockLeatherDialog />
        <ScrollRestoration />
        <Scripts />
      </styled.body>
    </html>
  );
}

export default function App() {
  const navigate = useNavigate();

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
