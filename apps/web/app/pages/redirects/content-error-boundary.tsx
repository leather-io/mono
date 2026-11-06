import { type MetaDescriptor, isRouteErrorResponse, useRouteError } from 'react-router';

import { ErrorPage } from '~/layouts/page/error';
import { meta as notFoundMeta } from '~/pages/error/error-not-found.route';
import { NotFound } from '~/pages/error/not-found';

function isMissingContentError(error: unknown) {
  return isRouteErrorResponse(error) && (error.status === 404 || error.status === 410);
}

/** Unknown or retired content slugs render the app's standard not-found page. */
export function ContentErrorBoundary() {
  const error = useRouteError();
  if (isMissingContentError(error)) return <NotFound />;
  return <ErrorPage error={error} />;
}

export function contentMeta({ error }: { error?: unknown }): MetaDescriptor[] {
  return isMissingContentError(error) ? notFoundMeta() : [];
}
