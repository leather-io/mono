import { ErrorLayout } from '~/features/error/error-layout';

import type { Route } from '../../../.react-router/types/app/+types/root';

export interface ErrorPageProps {
  error: Route.ErrorBoundaryProps['error'];
}

export function ErrorPage({ error }: ErrorPageProps) {
  return <ErrorLayout error={error} />;
}
