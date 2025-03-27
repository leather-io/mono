import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  ...prefix('stacking', [
    index('routes/stacking/index.tsx'),
    route('stack-in-pool/:slug', 'routes/stacking/stacking.tsx'),
  ]),
  route('docs', 'routes/docs.tsx'),
] satisfies RouteConfig;
