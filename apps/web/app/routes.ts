import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  route('stacking', 'pages/stacking/stacking.route.tsx'),
  ...prefix('stacking/pool/:slug', [
    index('pages/stacking/pooled/pooled-stacking.route.tsx'),
    route('active', 'pages/stacking/pooled/pooled-stacking-active.route.tsx'),
  ]),
  ...prefix('stacking/liquid/:slug', [
    index('pages/stacking/liquid/liquid-stacking.route.tsx'),
    route('active', 'pages/stacking/liquid/liquid-stacking-active.route.tsx'),
    route('increase', 'pages/stacking/liquid/liquid-stacking-increase.route.tsx'),
  ]),
  route('sbtc', 'pages/sbtc-rewards/sbtc.route.tsx'),
  route('*', 'pages/error/error-not-found.route.tsx'),
] satisfies RouteConfig;
