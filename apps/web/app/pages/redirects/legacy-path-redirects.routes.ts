import { type RouteConfigEntry, route } from '@react-router/dev/routes';

import { legacyRedirectPaths } from './legacy-path-redirects';

export const legacyPathRedirectRoutes: RouteConfigEntry[] = legacyRedirectPaths.map(path =>
  route(path.slice(1), 'pages/redirects/legacy-path-redirect.route.tsx', {
    id: `legacy-path-redirect${path}`,
  })
);
