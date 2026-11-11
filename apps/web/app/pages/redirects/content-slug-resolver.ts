import { data, redirect } from 'react-router';

import { cmsClient } from '~/constants/cms-client';

import {
  type HelpCenterGuideBySlugQueryResult,
  type PostBySlugQueryResult,
  helpCenterGuideBySlugQuery,
  postBySlugQuery,
} from '@leather.io/cms';

import {
  hasLeatherDocsGuide,
  leatherDocsGuideUrl,
  toLeatherDocsLocation,
} from './leather-docs-guides';
import { getLegacyContentTarget } from './legacy-content-redirects';
import { getDeprecationTarget, isDeprecatedContentSlug } from './shared-redirect-logic';

export type ContentPost = NonNullable<PostBySlugQueryResult>;
type ContentGuide = NonNullable<HelpCenterGuideBySlugQueryResult>;

/**
 * Where a content slug ends up. Every legacy content URL (`/posts/:slug`,
 * `/support/:slug`, `/support/guide/:slug`, `/help-center/...`) goes through
 * `resolveContentSlug`, so each one either serves, issues exactly one 301 to
 * its final URL, or returns a real 404/410. Nothing redirects to a URL that
 * would itself redirect. Help center guides are no longer served here: they
 * live on Leather Docs (GitBook), see leather-docs-guides.ts.
 */
type ContentSlugResolution<TPost = ContentPost> =
  | { kind: 'post'; post: TPost; canonicalPath: string }
  | { kind: 'redirect'; location: string }
  | { kind: 'gone' }
  | { kind: 'not-found' };

export interface ContentFetchers<TPost = ContentPost, TGuide = ContentGuide> {
  fetchPost(slug: string): Promise<TPost | null>;
  fetchGuide(slug: string): Promise<TGuide | null>;
}

/** Sanity-backed fetchers used by the routes; tests inject fakes. */
export const cmsContentFetchers: ContentFetchers = {
  fetchPost: slug => cmsClient.fetch(postBySlugQuery, { slug }),
  fetchGuide: slug => cmsClient.fetch(helpCenterGuideBySlugQuery, { slug }),
};

export function postPath(slug: string): `/${string}` {
  return `/posts/${encodeURIComponent(slug)}`;
}

export async function resolveContentSlug<TPost, TGuide>(
  slug: string,
  fetchers: ContentFetchers<TPost, TGuide>
): Promise<ContentSlugResolution<TPost>> {
  // Retired ordinals / runes / stamps content always points at its deprecation notice,
  // even where the original post or guide still exists in Sanity.
  const deprecationTarget = getDeprecationTarget(slug);
  if (deprecationTarget) return { kind: 'redirect', location: deprecationTarget };

  const [guide, post] = await Promise.all([fetchers.fetchGuide(slug), fetchers.fetchPost(slug)]);

  // A help center guide is the canonical home for a slug, even when an older post shares it.
  if (guide) return { kind: 'redirect', location: leatherDocsGuideUrl(slug) };
  if (post) return { kind: 'post', post, canonicalPath: postPath(slug) };

  // Slugs from the retired Framer/Notion collection that never made it into Sanity.
  const legacyTarget = getLegacyContentTarget(slug);
  if (legacyTarget?.action === 'redirect') {
    return { kind: 'redirect', location: toLeatherDocsLocation(legacyTarget.to) };
  }
  if (legacyTarget?.action === 'retire') return { kind: 'gone' };

  return { kind: 'not-found' };
}

function withSearch(location: string, request: Request) {
  const { search } = new URL(request.url);
  return search ? `${location}${search}` : location;
}

/**
 * Builds the response for any resolution the current route can't render itself:
 * a single 301 to the final URL, or a 404/410 for the route's error boundary.
 */
function unservedContentResponse(resolution: ContentSlugResolution<unknown>, request: Request) {
  switch (resolution.kind) {
    case 'post':
      return redirect(withSearch(resolution.canonicalPath, request), 301);
    case 'redirect':
      return redirect(withSearch(resolution.location, request), 301);
    case 'gone':
      return data('This page has been retired.', { status: 410 });
    case 'not-found':
    default:
      return data('The requested page could not be found.', { status: 404 });
  }
}

export async function loadPostBySlug<TPost, TGuide>(
  slug: string,
  request: Request,
  fetchers: ContentFetchers<TPost, TGuide>
): Promise<{ post: TPost }> {
  const resolution = await resolveContentSlug(slug, fetchers);
  if (resolution.kind === 'post') return { post: resolution.post };
  throw unservedContentResponse(resolution, request);
}

/** Legacy alias routes (`/guides/:slug`, `/security`, ...) never serve content themselves. */
export async function redirectContentSlug<TPost, TGuide>(
  slug: string,
  request: Request,
  fetchers: ContentFetchers<TPost, TGuide>
): Promise<never> {
  const resolution = await resolveContentSlug(slug, fetchers);
  throw unservedContentResponse(resolution, request);
}

/**
 * The retired help center routes (`/support/:slug`, `/support/guide/:slug`, `/help-center/...`):
 * a slug with a Leather Docs page goes straight there without a Sanity lookup; anything else
 * resolves like any other content slug (a post, a deprecation notice, the Guides home, or 404).
 */
export async function redirectHelpCenterSlug<TPost, TGuide>(
  slug: string,
  request: Request,
  fetchers: ContentFetchers<TPost, TGuide>
): Promise<never> {
  if (!isDeprecatedContentSlug(slug) && hasLeatherDocsGuide(slug)) {
    throw redirect(withSearch(leatherDocsGuideUrl(slug), request), 301);
  }
  return redirectContentSlug(slug, request, fetchers);
}
