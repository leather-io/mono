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
  route(
    'posts/bitcoin-stamps-src20',
    'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx',
    { id: 'redirect-bitcoin-stamps-src20' }
  ),
  route('posts/receive-stamps', 'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx', {
    id: 'redirect-receive-stamps',
  }),
  route('posts/receive-src20', 'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx', {
    id: 'redirect-receive-src20',
  }),
  route(
    'posts/what-are-brc20-tokens',
    'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx',
    { id: 'redirect-what-are-brc20-tokens' }
  ),
  route(
    'posts/what-is-the-brc-20-token-standard',
    'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx',
    { id: 'redirect-what-is-the-brc-20-token-standard' }
  ),
  route('posts/buy-brc20', 'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx', {
    id: 'redirect-buy-brc20',
  }),
  route('posts/receive-brc20', 'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx', {
    id: 'redirect-receive-brc20',
  }),
  route(
    'posts/send-brc-20-tokens',
    'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx',
    { id: 'redirect-send-brc-20-tokens' }
  ),
  route(
    'posts/mint-brc20-magic-eden',
    'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx',
    { id: 'redirect-mint-brc20-magic-eden' }
  ),
  route(
    'posts/may-partnerships-roundup-new-sources-for-ordinals-stamps-and-more',
    'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx',
    { id: 'redirect-may-partnerships-roundup-new-sources-for-ordinals-stamps-and-more' }
  ),
  route(
    'posts/send-ordinals',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-send-ordinals' }
  ),
  route(
    'posts/receive-ordinals',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-receive-ordinals' }
  ),
  route(
    'posts/create-ordinals-gamma',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-create-ordinals-gamma' }
  ),
  route(
    'posts/migrating-ordinals-sparrow-leather',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-migrating-ordinals-sparrow-leather' }
  ),
  route(
    'posts/leather-ordinalsbot',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-leather-ordinalsbot' }
  ),
  route(
    'posts/leather-magic-eden',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-leather-magic-eden' }
  ),
  route(
    'posts/leather-unisat',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-leather-unisat' }
  ),
  route(
    'posts/leather-luminex',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-leather-luminex' }
  ),
  route(
    'posts/what-are-bitcoin-ordinals',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-what-are-bitcoin-ordinals' }
  ),
  route(
    'posts/what-are-bitcoin-ordinals-wallets',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-what-are-bitcoin-ordinals-wallets' }
  ),
  route(
    'posts/ordinals-vs-nft',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-ordinals-vs-nft' }
  ),
  route(
    'posts/what-are-recursive-inscriptions',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-what-are-recursive-inscriptions' }
  ),
  route(
    'posts/parent-child-inscriptions',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-parent-child-inscriptions' }
  ),
  route(
    'posts/what-are-digital-artifacts-bitcoin',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-what-are-digital-artifacts-bitcoin' }
  ),
  route(
    'posts/how-do-i-unprotect-bitcoin-utxo-s-with-inscriptions-so-it-becomes-available',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-how-do-i-unprotect-bitcoin-utxo-s-with-inscriptions-so-it-becomes-available' }
  ),
  route(
    'posts/bitcoin-nfts',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-bitcoin-nfts' }
  ),
  route(
    'posts/native-segwit-inscriptions-support-goes-live-on-leather',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'redirect-native-segwit-inscriptions-support-goes-live-on-leather' }
  ),
  // A fallback to legacy post routes
  route('posts/:postSlug', 'pages/posts/post.route.tsx'),
  route('support', 'pages/support/help-center.route.tsx'),
  route('support/search', 'pages/support/search.tsx'),
  route('support/guide/:slug', 'pages/redirects/support-guide-redirect.route.tsx'),
  route(
    'support/send-brc-20-tokens',
    'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx',
    { id: 'support-redirect-send-brc-20-tokens' }
  ),
  route('support/receive-brc20', 'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx', {
    id: 'support-redirect-receive-brc20',
  }),
  route(
    'support/receive-stamps',
    'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx',
    { id: 'support-redirect-receive-stamps' }
  ),
  route(
    'support/what-are-brc20-tokens',
    'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx',
    { id: 'support-redirect-what-are-brc20-tokens' }
  ),
  route(
    'support/mint-brc20-magic-eden',
    'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx',
    { id: 'support-redirect-mint-brc20-magic-eden' }
  ),
  route('support/buy-brc20', 'pages/redirects/leather-stamps-src20-wallet-redirect.route.tsx', {
    id: 'support-redirect-buy-brc20',
  }),
  route(
    'support/send-ordinals',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'support-redirect-send-ordinals' }
  ),
  route(
    'support/receive-ordinals',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'support-redirect-receive-ordinals' }
  ),
  route(
    'support/what-are-bitcoin-ordinals',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'support-redirect-what-are-bitcoin-ordinals' }
  ),
  route(
    'support/how-do-i-unprotect-bitcoin-utxo-s-with-inscriptions-so-it-becomes-available',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    {
      id: 'support-redirect-how-do-i-unprotect-bitcoin-utxo-s-with-inscriptions-so-it-becomes-available',
    }
  ),
  route(
    'support/bitcoin-nfts',
    'pages/redirects/deprecation-of-ordinals-inscriptions-support-in-leather-redirect.route.tsx',
    { id: 'support-redirect-bitcoin-nfts' }
  ),
  route('support/:guideSlug', 'pages/support/guide/guide.route.tsx'),
  // Redirects from old help-center URLs
  route('help-center', 'pages/redirects/help-center-redirect.route.tsx'),
  route('help-center/*', 'pages/redirects/help-center-wildcard.route.tsx'),
  // Fallback route
  route('*', 'pages/error/error-not-found.route.tsx'),
] satisfies RouteConfig;
