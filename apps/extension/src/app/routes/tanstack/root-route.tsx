import { createRootRoute } from '@tanstack/react-router';

import { Container } from '@app/features/container/container';
import { RouterErrorBoundary } from '@app/features/errors/app-error-boundary';

export const rootRoute = createRootRoute({
  component: Container,
  errorComponent: RouterErrorBoundary,
});
