import { data, redirect } from 'react-router';

import { LEATHER_DOCS } from '~/constants/leather-docs';

import {
  hasLeatherDocsBlogPage,
  hasLeatherDocsGuide,
  leatherDocsBlogUrl,
  leatherDocsGuideUrl,
} from './leather-docs-guides';
import { getLegacyContentTarget } from './legacy-content-redirects';
import { legacyGuideSlugs, legacyPostSlugs } from './legacy-content-slugs';
import { getRetiredPostFallback, getRetiredPostPage } from './retired-posts';
import { getDeprecationTarget } from './shared-redirect-logic';

// Every legacy content URL issues exactly one 301 to its final URL, or a real 404: never a
// redirect to a URL that would itself redirect.
type ContentSlugResolution = { kind: 'redirect'; location: string } | { kind: 'not-found' };

export interface ContentFetchers {
  hasPost(slug: string): Promise<boolean>;
  hasGuide(slug: string): Promise<boolean>;
}

const postSlugs = new Set(legacyPostSlugs);
const guideSlugs = new Set(legacyGuideSlugs);

/** Lookups over the exported post and guide slugs for the alias routes; tests inject fakes. */
export const legacyContentFetchers: ContentFetchers = {
  hasPost: slug => Promise.resolve(postSlugs.has(slug)),
  hasGuide: slug => Promise.resolve(guideSlugs.has(slug)),
};

/** The final URL for a slug known to the repo's redirect data, without the content lookups. */
function getKnownContentTarget(slug: string) {
  // Retired ordinals / runes / stamps content always points at its deprecation notice,
  // even where the original post or guide existed in Sanity.
  const deprecationTarget = getDeprecationTarget(slug);
  if (deprecationTarget) return deprecationTarget;
  if (hasLeatherDocsGuide(slug)) return leatherDocsGuideUrl(slug);
  if (hasLeatherDocsBlogPage(slug)) return leatherDocsBlogUrl(slug);
  const retiredPostPage = getRetiredPostPage(slug);
  if (retiredPostPage) return retiredPostPage;
  // Slugs from the retired Framer/Notion collection that never made it into Sanity.
  return getLegacyContentTarget(slug);
}

export async function resolveContentSlug(
  slug: string,
  fetchers: ContentFetchers
): Promise<ContentSlugResolution> {
  const knownTarget = getKnownContentTarget(slug);
  if (knownTarget) return { kind: 'redirect', location: knownTarget };

  const [guide, post] = await Promise.all([fetchers.hasGuide(slug), fetchers.hasPost(slug)]);

  // A help center guide Leather Docs has no page for goes to the Guides home, even when an
  // older post shares its slug.
  if (guide) return { kind: 'redirect', location: LEATHER_DOCS.guides };
  if (post) return { kind: 'redirect', location: getRetiredPostFallback(slug) };

  return { kind: 'not-found' };
}

function withSearch(location: string, request: Request) {
  const { search } = new URL(request.url);
  return search ? `${location}${search}` : location;
}

/** Legacy alias routes (`/guides/:slug`, `/security`, ...): one 301 to the final URL, or a 404. */
export async function redirectContentSlug(
  slug: string,
  request: Request,
  fetchers: ContentFetchers
): Promise<never> {
  const resolution = await resolveContentSlug(slug, fetchers);
  if (resolution.kind === 'redirect') throw redirect(withSearch(resolution.location, request), 301);
  throw data('The requested page could not be found.', { status: 404 });
}

/**
 * `/posts/:slug` always redirects, without the content lookups: posts are retired, so any slug
 * without a more specific home goes to /apps or the docs blog.
 */
export function redirectPostSlug(slug: string, request: Request): never {
  const location = getKnownContentTarget(slug) ?? getRetiredPostFallback(slug);
  throw redirect(withSearch(location, request), 301);
}
