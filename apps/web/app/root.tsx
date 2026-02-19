import { Links, Meta, Scripts, ScrollRestoration } from 'react-router';

import { css } from 'leather-styles/css';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { Buffer } from 'safe-buffer';

import { HasChildren } from '@leather.io/ui';
import leatherUiStyles from '@leather.io/ui/styles?url';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { defaultMetaTags } from './constants/meta-tags';
import { organizationSchema } from './constants/structured-data';
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

const maxWidthCss = css({
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%',
});

export function Layout({ children }: HasChildren) {
  return (
    <html lang="en">
      <head>
        <Meta />
        {defaultMetaTags.map((meta, i) => (
          <meta key={'meta' + i} {...meta} />
        ))}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Links />
      </head>
      <styled.body>
        <GlobalLoader />
        <Nav />
        <Flex
          flexDir="column"
          marginLeft={[null, null, 'navbar']}
          minHeight="100vh"
          px={['space.04', null, 'space.07']}
        >
          <styled.main flex={1} bg="ink.background-primary" className={maxWidthCss}>
            {children}
          </styled.main>
          <Box className={maxWidthCss}>
            <Footer />
          </Box>
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
