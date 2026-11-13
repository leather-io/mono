/**
 * Short paths from the retired Framer site's redirect table (leather.io/download, ...)
 * and the retired in-app help center and developers pages. Each resolves in a
 * single 301 to its final URL. Entries with a `slug` go through the content resolver, so they
 * follow the content if it ever moves; `docs` entries go to a section of Leather Docs (GitBook).
 *
 * Kept free of runtime imports so `routes.ts` can read the path list.
 */
type LegacyPathTarget = { slug: string } | { to: `/${string}` } | { docs: 'guides' | 'developers' };

const legacyPathRedirects = new Map<string, LegacyPathTarget>([
  ['/terms-of-service', { to: '/terms' }],
  ['/security', { slug: 'security' }],
  // The wallet download pages were not rebuilt: installing lives on the home page now.
  // /wallet/mobile is still linked from shipped extension builds (promo banner).
  ['/wallet', { to: '/' }],
  ['/wallet/mobile', { to: '/' }],
  ['/wallet/extension', { to: '/' }],
  ['/download', { to: '/' }],
  ['/install', { to: '/' }],
  ['/contact', { docs: 'guides' }],
  ['/help', { docs: 'guides' }],
  ['/guides', { docs: 'guides' }],
  ['/frequent-questions', { docs: 'guides' }],
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
  ['/old-page/guides', { docs: 'guides' }],
  ['/old-page/frequent-questions', { docs: 'guides' }],
  ['/old-page/contact', { docs: 'guides' }],
  ['/old-page/developer-docs', { docs: 'developers' }],
  ['/old-page/privacy-policy', { to: '/privacy-policy' }],
  ['/old-page/terms', { to: '/terms' }],
  // The in-app help center and developers page, retired for Leather Docs
  ['/developers', { docs: 'developers' }],
  ['/support', { docs: 'guides' }],
  ['/support/search', { docs: 'guides' }],
  ['/help-center', { docs: 'guides' }],
]);

export const legacyRedirectPaths = [...legacyPathRedirects.keys()];

export function getLegacyPathTarget(pathname: string): LegacyPathTarget | null {
  const normalised = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return legacyPathRedirects.get(normalised) ?? null;
}
