import { type RouteConfigEntry, index, layout, prefix, route } from '@react-router/dev/routes';

import { playgroundAreas } from './playground-areas';

// All playground routes live here and are spread into routes.ts with a single
// `...playgroundRoutes` line. Routes stay registered in every build; the
// layout loader 404s the whole area on the production deploy (same pattern as
// multisig).
//
// Area routes are derived from the registry: an area at slug `foo` must have
// its route module at areas/foo/foo.route.tsx. Adding an area is a folder
// plus one registry entry — no playground code changes.
export const playgroundRoutes: RouteConfigEntry[] = prefix('playground', [
  layout('pages/playground/playground.layout.tsx', [
    index('pages/playground/playground-index.route.tsx'),
    ...playgroundAreas.map(area =>
      route(area.slug, `pages/playground/areas/${area.slug}/${area.slug}.route.tsx`)
    ),
  ]),
]);
