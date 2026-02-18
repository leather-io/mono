import { createHashHistory, createRouter } from '@tanstack/react-router';

import { RouterErrorBoundary } from '@app/features/errors/app-error-boundary';

import { routeTree } from './route-tree';

const hashHistory = createHashHistory();

export const tanstackRouter = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: 'intent',
  defaultErrorComponent: RouterErrorBoundary,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof tanstackRouter;
  }
}
