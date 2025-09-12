import leatherUiStyles from '@leather.io/ui/styles?url';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { ErrorPage } from './layouts/page/error';

export function links() {
  return [
    { rel: 'stylesheet', href: stylesheet },
    { rel: 'stylesheet', href: leatherUiStyles },
  ] satisfies Route.LinkDescriptors;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <ErrorPage error={error} />;
}

export { default, Layout } from './app';
