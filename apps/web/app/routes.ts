import { type RouteConfig, index, route } from '@react-router/dev/routes';

import { bitcoinStakingRoutes } from './pages/bitcoin-staking/bitcoin-staking.routes';
import { multisigRoutes } from './pages/multisig/multisig.routes';
import { playgroundRoutes } from './pages/playground/playground.routes';
import { legacyPathRedirectRoutes } from './pages/redirects/legacy-path-redirects.routes';

export default [
  index('pages/marketing/home/home.route.tsx'),
  // Marketing pages, formerly served by Framer on leather.io
  route('apps', 'pages/marketing/apps/apps.route.tsx'),
  route('developers', 'pages/marketing/developers/developers.route.tsx'),
  route('news', 'pages/marketing/news/news.route.tsx'),
  route('explorer', 'pages/marketing/explorer/explorer.route.tsx'),
  // sBTC
  route('sbtc', 'pages/sbtc/sbtc.route.tsx'),
  // Changelog
  route('changelog', 'pages/changelog/changelog.route.tsx'),
  route('changelog/:slug', 'pages/changelog/changelog-entry.route.tsx'),
  route('changelog.xml', 'pages/changelog/changelog-rss.route.tsx'),
  route('portfolio', 'pages/portfolio/portfolio.route.tsx'),
  // Legacy content: /posts/:slug, /support/:slug and every legacy alias resolve through
  // pages/redirects/content-slug-resolver.ts (serve, one 301 to the final URL, or 404/410)
  route('posts', 'pages/posts/posts.route.tsx'),
  route('posts/:postSlug', 'pages/posts/post.route.tsx'),
  route('support', 'pages/support/help-center.route.tsx'),
  route('support/search', 'pages/support/search.tsx'),
  route('support/guide/:slug', 'pages/redirects/support-guide-redirect.route.tsx'),
  route('support/:guideSlug', 'pages/support/guide/guide.route.tsx'),
  // Redirects from old help-center URLs
  route('help-center', 'pages/redirects/help-center-redirect.route.tsx'),
  route('help-center/*', 'pages/redirects/help-center-wildcard.route.tsx'),
  // Redirects from the retired Framer site (leather.io/guides/:slug, /privacy-policy, /download, ...)
  route('guides/*', 'pages/redirects/guides-wildcard.route.tsx'),
  ...legacyPathRedirectRoutes,
  // Redirects from the retired stacking URLs, now served under /staking
  route('stacking', 'pages/redirects/stacking-redirect.route.tsx'),
  route('stacking/*', 'pages/redirects/stacking-wildcard.route.tsx'),
  ...multisigRoutes,
  ...playgroundRoutes,
  ...bitcoinStakingRoutes,
  // SEO resource routes, formerly served by Framer
  route('robots.txt', 'pages/seo/robots.route.ts'),
  route('sitemap.xml', 'pages/seo/sitemap.route.ts'),
  // Fallback route
  route('*', 'pages/error/error-not-found.route.tsx'),
] satisfies RouteConfig;
