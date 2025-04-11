import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/stacking/index.tsx'),
  route('pooled-stacking/:slug', 'routes/stacking/pooled-stacking.tsx'),
  route('liquid-stacking/:slug', 'routes/stacking/liquid-stacking.tsx'),
  route('sbtc-rewards', 'routes/sbtc-rewards.tsx'),
  route('*', 'routes/error-not-found.tsx'),
] satisfies RouteConfig;
