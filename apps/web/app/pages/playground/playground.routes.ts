import { type RouteConfigEntry, index, layout, prefix, route } from '@react-router/dev/routes';

// All playground routes live here and are spread into routes.ts with a single
// `...playgroundRoutes` line. Routes stay registered in every build; the
// layout loader 404s the whole area on the production deploy (same pattern as
// multisig). Each area adds exactly one route() line below.
export const playgroundRoutes: RouteConfigEntry[] = prefix('playground', [
  layout('pages/playground/playground.layout.tsx', [
    index('pages/playground/playground-index.route.tsx'),
    route('welcome', 'pages/playground/areas/welcome/welcome.route.tsx'),
    route(
      'component-gallery',
      'pages/playground/areas/component-gallery/component-gallery.route.tsx'
    ),
    route('page-gallery', 'pages/playground/areas/page-gallery/page-gallery.route.tsx'),
  ]),
]);
