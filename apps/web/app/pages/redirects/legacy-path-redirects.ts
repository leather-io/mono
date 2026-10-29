/**
 * Short paths from the retired Framer site's redirect table (leather.io/privacy-policy,
 * /download, ...). Each resolves in a single 301 to its final URL. Entries with a `slug`
 * go through the content resolver, so they follow the content if it ever moves.
 *
 * Kept free of runtime imports so `routes.ts` can read the path list.
 */
export type LegacyPathTarget = { slug: string } | { to: `/${string}` };

const legacyPathRedirects = new Map<string, LegacyPathTarget>([
  ['/privacy-policy', { slug: 'privacy-policy' }],
  ['/terms', { slug: 'terms-of-service' }],
  ['/security', { slug: 'security' }],
  // The wallet download pages were not rebuilt: installing lives on the home page now.
  // /wallet/mobile is still linked from shipped extension builds (promo banner).
  ['/wallet', { to: '/' }],
  ['/wallet/mobile', { to: '/' }],
  ['/wallet/extension', { to: '/' }],
  ['/download', { to: '/' }],
  ['/install', { to: '/' }],
  ['/contact', { to: '/support' }],
  ['/help', { to: '/support' }],
  ['/guides', { to: '/support' }],
  ['/frequent-questions', { to: '/support' }],
  ['/wallet-apps', { slug: 'wallets-comparison' }],
  ['/mobilewaitlist', { to: '/' }],
  ['/install-desktop', { to: '/' }],
  ['/install-extension', { to: '/' }],
  // The pre-2025 site, still reachable on Framer under /old-page/*
  ['/old-page', { to: '/' }],
  ['/old-page/home', { to: '/' }],
  ['/old-page/install-extension', { to: '/' }],
  ['/old-page/install-desktop', { to: '/' }],
  ['/old-page/mobilewaitlist', { to: '/' }],
  ['/old-page/wallet-apps', { slug: 'wallets-comparison' }],
  ['/old-page/blog', { to: '/posts' }],
  ['/old-page/learn', { to: '/posts' }],
  ['/old-page/guides', { to: '/support' }],
  ['/old-page/frequent-questions', { to: '/support' }],
  ['/old-page/contact', { to: '/support' }],
  ['/old-page/developer-docs', { to: '/developers' }],
  ['/old-page/privacy-policy', { slug: 'privacy-policy' }],
  ['/old-page/terms', { slug: 'terms-of-service' }],
]);

export const legacyRedirectPaths = [...legacyPathRedirects.keys()];

export function getLegacyPathTarget(pathname: string): LegacyPathTarget | null {
  const normalised = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return legacyPathRedirects.get(normalised) ?? null;
}
