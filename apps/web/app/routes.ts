import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  ...prefix('stacking', [
    index('routes/stacking/index.tsx'),
    route('pooled-stacking/:slug', 'routes/stacking/pooled-stacking.tsx'),
    route('liquid-stacking/:slug', 'routes/stacking/liquid-stacking.tsx'),
  ]),
  route('docs', 'routes/docs.tsx'),
  route('sbtc-rewards', 'routes/sbtc-rewards.tsx'),
  // Catch-all route for 404 pages - must be last
  route('*', 'routes/error-not-found.tsx'),
] satisfies RouteConfig;
