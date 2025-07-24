import { isRouteErrorResponse } from 'react-router';

import * as Sentry from '@sentry/react-router';
import { Flex, styled } from 'leather-styles/jsx';
import { content } from '~/data/content';

import type { Route } from '../../+types/root';

export interface ErrorLayoutProps {
  error: Route.ErrorBoundaryProps['error'];
}

export function ErrorLayout({ error }: ErrorLayoutProps) {
  let message: string = content.errorMessages.oops;
  let details: string = content.errorMessages.unexpected;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? content.errorMessages.error404 : content.errorMessages.error;
    details =
      error.data ||
      (error.status === 404 ? content.errorMessages.notFound : error.statusText) ||
      details;
    Sentry.captureException(error);
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Flex alignItems="center" flexDirection="column" justifyContent="center" width="100%">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <styled.pre maxWidth="100%" overflow="auto">
          <code>{stack}</code>
        </styled.pre>
      )}
    </Flex>
  );
}
