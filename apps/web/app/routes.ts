import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  index('routes/stacking/index.tsx'),
  ...prefix('pooled-stacking/:slug', [
    index('routes/stacking/pooled-stacking.tsx'),
    route('active', 'routes/stacking/pooled-stacking-active.tsx'),
  ]),
  ...prefix('liquid-stacking/:slug', [
    index('routes/stacking/liquid-stacking.tsx'),
    route('active', 'routes/stacking/liquid-stacking-active.tsx'),
  ]),
  route('sbtc', 'routes/sbtc.tsx'),
  route('*', 'routes/error-not-found.tsx'),
] satisfies RouteConfig;
