import { isRouteErrorResponse } from 'react-router';

import { Flex } from 'leather-styles/jsx';

import type { Route } from '../../+types/root';

export interface ErrorLayoutProps {
  error: Route.ErrorBoundaryProps['error'];
}

export function ErrorLayout({ error }: ErrorLayoutProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.data ||
      (error.status === 404 ? 'The requested page could not be found.' : error.statusText) ||
      details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Flex alignItems="center" flexDirection="column" justifyContent="center">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </Flex>
  );
}
