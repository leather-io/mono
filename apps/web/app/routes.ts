import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

import { bitcoinStakingRoutes } from './pages/bitcoin-staking/bitcoin-staking.routes';
import { multisigRoutes } from './pages/multisig/multisig.routes';
import { playgroundRoutes } from './pages/playground/playground.routes';

export default [
  index('pages/index.route.tsx'),
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
  // A fallback to legacy post routes
  route('posts/:postSlug', 'pages/posts/post.route.tsx'),
  route('support', 'pages/support/help-center.route.tsx'),
  route('support/search', 'pages/support/search.tsx'),
  route('support/guide/:slug', 'pages/redirects/support-guide-redirect.route.tsx'),
  route('support/:guideSlug', 'pages/support/guide/guide.route.tsx'),
  // Redirects from old help-center URLs
  route('help-center', 'pages/redirects/help-center-redirect.route.tsx'),
  route('help-center/*', 'pages/redirects/help-center-wildcard.route.tsx'),
  // Redirects from the retired stacking URLs, now served under /staking
  route('stacking', 'pages/redirects/stacking-redirect.route.tsx'),
  route('stacking/*', 'pages/redirects/stacking-wildcard.route.tsx'),
  ...multisigRoutes,
  ...playgroundRoutes,
  ...bitcoinStakingRoutes,
  // Fallback route
  route('*', 'pages/error/error-not-found.route.tsx'),
] satisfies RouteConfig;
