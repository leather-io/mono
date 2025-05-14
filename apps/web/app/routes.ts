import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  route('stacking', 'routes/stacking/stacking.page.tsx'),
  ...prefix('stacking/pool/:slug', [
    index('routes/stacking/pooled-stacking.page.tsx'),
    route('active', 'routes/stacking/pooled-stacking-active.page.tsx'),
  ]),
  ...prefix('stacking/liquid/:slug', [
    index('routes/stacking/liquid-stacking.page.tsx'),
    route('active', 'routes/stacking/liquid-stacking-active.page.tsx'),
    route('increase', 'routes/stacking/liquid-stacking-increase.page.tsx'),
  ]),
  route('sbtc', 'routes/sbtc.page.tsx'),
  route('*', 'routes/error-not-found.page.tsx'),
] satisfies RouteConfig;
