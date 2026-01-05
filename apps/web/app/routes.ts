import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  // Stacking routes
  route('stacking', 'pages/stacking/stacking.route.tsx'),
  ...prefix('stacking/pool/:slug', [
    index('pages/stacking/pooled/pooled-stacking.route.tsx'),
    route('active', 'pages/stacking/pooled/pooled-stacking-active.route.tsx'),
  ]),
  // Liquid Stacking routes
  ...prefix('stacking/liquid/:slug', [
    index('pages/stacking/liquid/liquid-stacking.route.tsx'),
    route('active', 'pages/stacking/liquid/liquid-stacking-active.route.tsx'),
    route('increase', 'pages/stacking/liquid/liquid-stacking-increase.route.tsx'),
  ]),
  // sBTC
  route('sbtc', 'pages/sbtc/sbtc.route.tsx'),
  // Changelog
  route('changelog', 'pages/changelog/changelog.route.tsx'),
  route('changelog/:slug', 'pages/changelog/changelog-entry.route.tsx'),
  route('changelog.xml', 'pages/changelog/changelog-rss.route.tsx'),
  route('portfolio', 'pages/portfolio/portfolio.route.tsx'),
  // Advanced Leather tools
  ...prefix('advanced', [
    index('pages/advanced/advanced.route.tsx'),
    route('signer-key-generation', 'pages/advanced/tools/signer-key-generation.route.tsx'),
  ]),
  route('help-center', 'pages/help-center/help-center.route.tsx'),
  ...prefix('help-center/:slug', [
    index('pages/help-center/category-guides/category-guides.route.tsx'),
  ]),
  ...prefix('help-center/guide/:slug', [index('pages/help-center/guide/guide.route.tsx')]),
  // Fallback route
  route('*', 'pages/error/error-not-found.route.tsx'),
] satisfies RouteConfig;
