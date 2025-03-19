import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  ...prefix('earn', [
    index('routes/earn/index.tsx'),
    route('stacking', 'routes/earn/stacking.tsx'),
  ]),
  route('docs', 'routes/docs.tsx'),
] satisfies RouteConfig;
