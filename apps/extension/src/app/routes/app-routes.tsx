import { RouterProvider } from '@tanstack/react-router';

import { tanstackRouter } from '@app/routes/tanstack/router';

export function AppRoutes() {
  return <RouterProvider router={tanstackRouter} />;
}
