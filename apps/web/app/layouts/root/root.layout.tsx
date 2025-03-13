import { Links, Meta, Scripts, ScrollRestoration } from 'react-router';

import { styled } from 'leather-styles/jsx';

import type { HasChildren } from '@leather.io/ui';

import { GlobalLoader } from '../nav/global-loader';
import { Nav } from '../nav/nav';

export function RootLayout({ children }: HasChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <styled.body display="flex" height="100vh">
        <GlobalLoader />
        <Nav />
        <styled.main>{children}</styled.main>
        <ScrollRestoration />
        <Scripts />
      </styled.body>
    </html>
  );
}
