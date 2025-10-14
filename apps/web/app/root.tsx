import { Links, Meta, Scripts, ScrollRestoration } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';
import { Buffer } from 'safe-buffer';

import { HasChildren } from '@leather.io/ui';
import leatherUiStyles from '@leather.io/ui/styles?url';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { defaultMetaTags } from './constants/meta-tags';
import { InstallDialog } from './features/install-dialog/install-dialog';
import { MockLeatherDialog } from './features/mock-dialog/mock-dialog';
import { Footer } from './layouts/footer/footer';
import { GlobalLoader } from './layouts/nav/global-loader';
import { Nav } from './layouts/nav/nav';
import { ErrorPage } from './layouts/page/error';

// Polyfill global Buffer
// @ts-expect-error safe-buffer typings are too old
globalThis.Buffer = Buffer;

export function links() {
  return [
    { rel: 'stylesheet', href: stylesheet },
    { rel: 'stylesheet', href: leatherUiStyles },
  ] satisfies Route.LinkDescriptors;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <ErrorPage error={error} />;
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

export { default } from './app';
