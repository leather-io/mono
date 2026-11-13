import { data, redirect } from 'react-router';

import { cmsClient } from '~/constants/cms-client';
import { LEATHER_DOCS } from '~/constants/leather-docs';

import {
  hasLeatherDocsBlogPage,
  hasLeatherDocsGuide,
  leatherDocsBlogUrl,
  leatherDocsGuideUrl,
} from './leather-docs-guides';
import { getLegacyContentTarget } from './legacy-content-redirects';
import { getRetiredPostFallback, getRetiredPostPage } from './retired-posts';
import { getDeprecationTarget } from './shared-redirect-logic';

/**
 * Where a content slug ends up. The app no longer serves posts or help center guides: every
 * legacy content URL (`/posts/:slug`, `/support/:slug`, `/support/guide/:slug`,
 * `/help-center/...`) issues exactly one 301 to its final URL, or returns a real 404. Nothing
 * redirects to a URL that would itself redirect. Guides and explainers live on Leather Docs
 * (GitBook), see leather-docs-guides.ts; other posts go to the docs blog, /apps or a legal page.
 */
type ContentSlugResolution = { kind: 'redirect'; location: string } | { kind: 'not-found' };

export interface ContentFetchers {
  hasPost(slug: string): Promise<boolean>;
  hasGuide(slug: string): Promise<boolean>;
}

const contentExistsQuery = `defined(*[_type == $type && slug.current == $slug][0]._id)`;

/** Sanity-backed lookups used by the alias routes; tests inject fakes. */
export const cmsContentFetchers: ContentFetchers = {
  hasPost: slug => cmsClient.fetch<boolean>(contentExistsQuery, { type: 'post', slug }),
  hasGuide: slug => cmsClient.fetch<boolean>(contentExistsQuery, { type: 'helpCenterGuide', slug }),
};

/** The final URL for a slug known to the repo's redirect data, without asking Sanity. */
function getKnownContentTarget(slug: string) {
  // Retired ordinals / runes / stamps content always points at its deprecation notice,
  // even where the original post or guide still exists in Sanity.
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
 * `/posts/:slug` always redirects, without asking Sanity: posts are retired, so any slug
 * without a more specific home goes to /apps or the docs blog.
 */
export function redirectPostSlug(slug: string, request: Request): never {
  const location = getKnownContentTarget(slug) ?? getRetiredPostFallback(slug);
  throw redirect(withSearch(location, request), 301);
}
