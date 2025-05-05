import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Flex, styled } from 'leather-styles/jsx';

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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 60_000,
      staleTime: 300_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
  },
});

export default function App() {
  useOnRouteChange(location => analytics.page(location.pathname));

  return (
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider delayDuration={320}>
        <Outlet />
      </Tooltip.Provider>
    </QueryClientProvider>
  );
}
