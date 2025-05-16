import { Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigate } from 'react-router';

import { QueryClientProvider } from '@tanstack/react-query';
import { Flex, styled } from 'leather-styles/jsx';
import { queryClient } from '~/constants/query-client';

import type { LeatherProvider } from '@leather.io/rpc';
import { Tooltip } from '@leather.io/ui';

import { defaultMetaTags } from './constants/default-meta-tags';
import { analytics } from './features/analytics/analytics';
import { useOnRouteChange } from './features/analytics/use-on-route-change';
import { Footer } from './layouts/footer/footer';
import { GlobalLoader } from './layouts/nav/global-loader';
import { Nav } from './layouts/nav/nav';

declare global {
  interface Window {
    LeatherProvider?: LeatherProvider;
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
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
          <styled.main flex={1}>{children}</styled.main>
          <Footer />
        </Flex>
        <ScrollRestoration />
        <Scripts />
      </styled.body>
    </html>
  );
}

export default function App() {
  useOnRouteChange(location => analytics.page(location.pathname));

  const navigate = useNavigate();
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
