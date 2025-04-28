import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  index('routes/stacking/stacking.page.tsx'),
  ...prefix('pooled-stacking/:slug', [
    index('routes/stacking/pooled-stacking.page.tsx'),
    route('active', 'routes/stacking/pooled-stacking-active.page.tsx'),
  ]),
  ...prefix('liquid-stacking/:slug', [
    index('routes/stacking/liquid-stacking.page.tsx'),
    route('active', 'routes/stacking/liquid-stacking-active.page.tsx'),
  ]),
  route('sbtc', 'routes/sbtc.page.tsx'),
  route('*', 'routes/error-not-found.page.tsx'),
] satisfies RouteConfig;
