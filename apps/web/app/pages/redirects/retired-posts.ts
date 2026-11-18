import { LEATHER_DOCS } from '~/constants/leather-docs';

export const appsPagePath = '/apps';

// Sanity posts in the "Apps" category, one per partner app. The apps are listed on /apps now.
const appPostSlugs = new Set([
  'alex',
  'arkadiko',
  'bitflow',
  'brotocol',
  'charisma',
  'granite',
  'hermetica',
  'lisa',
  'stacking-dao',
  'velar',
  'zest',
]);

// Sanity posts in the "Legal" category that the app serves from the repo (see pages/legal)
const legalPagePaths = new Map<string, string>([
  ['privacy-policy', '/privacy-policy'],
  ['terms-of-service', '/terms'],
]);

/** The page that replaced an app or legal post, if the slug is one. */
export function getRetiredPostPage(slug: string) {
  return legalPagePaths.get(slug) ?? (appPostSlugs.has(slug) ? appsPagePath : null);
}

/**
 * Where a retired post goes when nothing more specific replaced it: app listings (`apps-*`) to
 * /apps, everything else (news, spotlights, explainers without a docs page) to the docs blog.
 */
export function getRetiredPostFallback(slug: string) {
  return slug.startsWith('apps-') ? appsPagePath : LEATHER_DOCS.blog;
}
