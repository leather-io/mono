import { isRouteErrorResponse } from 'react-router';

import * as Sentry from '@sentry/react-router';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { errorMessages } from '~/content/messages';

import type { Route } from '../../+types/root';

interface ErrorLayoutProps {
  error: Route.ErrorBoundaryProps['error'];
}

export function ErrorLayout({ error }: ErrorLayoutProps) {
  let message: string = errorMessages.oops;
  let details: string = errorMessages.unexpected;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? errorMessages.error404 : errorMessages.error;
    details =
      error.data || (error.status === 404 ? errorMessages.notFound : error.statusText) || details;
    Sentry.captureException(error);
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Flex
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      width="100%"
      height="100%"
      minHeight="100%"
      py="space.10"
      textAlign="center"
    >
      <Box maxWidth="640px" width="100%" px="space.05">
        <styled.h1 textStyle="heading.03">{message}</styled.h1>
        <styled.p mt="space.03" textStyle="body.02">
          {details}
        </styled.p>

        {stack && (
          <styled.pre
            mt="space.06"
            p="space.04"
            borderRadius="md"
            bg="ink.background-secondary"
            maxHeight="360px"
            overflow="auto"
            textAlign="left"
          >
            <code>{stack}</code>
          </styled.pre>
        )}
      </Box>
    </Flex>
  );
}
