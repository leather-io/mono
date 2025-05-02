import { Buffer } from 'safe-buffer';

import leatherUiStyles from '@leather.io/ui/styles?url';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { ErrorPage } from './features/page/error';

// Polyfill global Buffer
// @ts-expect-error safe-buffer typings are too old
globalThis.Buffer = Buffer;

export function links() {
  return [
    { rel: 'stylesheet', href: stylesheet },
    { rel: 'stylesheet', href: leatherUiStyles },
    { rel: 'preconnect', href: 'https://lskjdflksjdfklsdfjlss.com' },
  ] satisfies Route.LinkDescriptors;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <ErrorPage error={error} />;
}

export { default, Layout } from './app';
