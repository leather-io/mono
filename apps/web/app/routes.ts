import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  index('pages/index.route.tsx'),
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
  route('posts/ordinals-vs-runes', 'pages/redirects/leather-runes-wallet-redirect.route.tsx', {
    id: 'redirect-ordinals-vs-runes',
  }),
  route('posts/bitcoin-runes', 'pages/redirects/leather-runes-wallet-redirect.route.tsx', {
    id: 'redirect-bitcoin-runes',
  }),
  route(
    'posts/see-your-runes-in-usd-with-leather',
    'pages/redirects/leather-runes-wallet-redirect.route.tsx',
    { id: 'redirect-see-your-runes-in-usd-with-leather' }
  ),
  route(
    'posts/april-partnership-roundup-more-runes-and-more-bitcoin-defi',
    'pages/redirects/leather-runes-wallet-redirect.route.tsx',
    { id: 'redirect-april-partnership-roundup-more-runes-and-more-bitcoin-defi' }
  ),
  route(
    'posts/bitcoin-runes-have-come-to-leather-unpacking-the-runes-protocol',
    'pages/redirects/leather-runes-wallet-redirect.route.tsx',
    { id: 'redirect-bitcoin-runes-have-come-to-leather-unpacking-the-runes-protocol' }
  ),
  route(
    'posts/august-partnerships-roundup-do-more-with-your-bitcoin-runes-and-tokens',
    'pages/redirects/leather-runes-wallet-redirect.route.tsx',
    { id: 'redirect-august-partnerships-roundup-do-more-with-your-bitcoin-runes-and-tokens' }
  ),
  // A fallback to legacy post routes
  route('posts/:postSlug', 'pages/posts/post.route.tsx'),
  route('support', 'pages/support/help-center.route.tsx'),
  route('support/search', 'pages/support/search.tsx'),
  route('support/guide/:slug', 'pages/redirects/support-guide-redirect.route.tsx'),
  route('support/:guideSlug', 'pages/support/guide/guide.route.tsx'),
  // Redirects from old help-center URLs
  route('help-center', 'pages/redirects/help-center-redirect.route.tsx'),
  route('help-center/*', 'pages/redirects/help-center-wildcard.route.tsx'),
  // Fallback route
  route('*', 'pages/error/error-not-found.route.tsx'),
] satisfies RouteConfig;
