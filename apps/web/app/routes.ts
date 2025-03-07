import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('earn', 'routes/earn.tsx'),
  route('docs', 'routes/docs.tsx'),
] satisfies RouteConfig;
