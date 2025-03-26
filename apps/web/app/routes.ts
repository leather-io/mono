import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('stacking', 'routes/stacking.tsx'),
  route('sbtc-rewards', 'routes/sbtc-rewards.tsx'),
  route('docs', 'routes/docs.tsx'),
] satisfies RouteConfig;
