import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  route('stacking', 'pages/stacking/stacking.page.tsx'),
  ...prefix('stacking/pool/:slug', [
    index('pages/stacking/pooled/pooled-stacking.page.tsx'),
    route('active', 'pages/stacking/pooled/pooled-stacking-active.page.tsx'),
  ]),
  ...prefix('stacking/liquid/:slug', [
    index('pages/stacking/liquid/liquid-stacking.page.tsx'),
    route('active', 'pages/stacking/liquid/liquid-stacking-active.page.tsx'),
    route('increase', 'pages/stacking/liquid/liquid-stacking-increase.page.tsx'),
  ]),
  route('sbtc', 'pages/sbtc-rewards/sbtc.page.tsx'),
  route('*', 'pages/error/error-not-found.page.tsx'),
] satisfies RouteConfig;
