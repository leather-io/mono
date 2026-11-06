import { data, redirect } from 'react-router';

import { cmsClient } from '~/constants/cms-client';

import {
  type HelpCenterGuideBySlugQueryResult,
  type PostBySlugQueryResult,
  helpCenterGuideBySlugQuery,
  postBySlugQuery,
} from '@leather.io/cms';

import { getLegacyContentTarget } from './legacy-content-redirects';
import { getDeprecationTarget } from './shared-redirect-logic';

export type ContentPost = NonNullable<PostBySlugQueryResult>;
export type ContentGuide = NonNullable<HelpCenterGuideBySlugQueryResult>;

/**
 * Where a content slug ends up. Every legacy content URL (`/posts/:slug`,
 * `/support/:slug`, `/support/guide/:slug`, `/help-center/...`) goes through
 * `resolveContentSlug`, so each one either serves, issues exactly one 301 to
 * its final URL, or returns a real 404/410. Nothing redirects to a URL that
 * would itself redirect.
 */
type ContentSlugResolution<TPost = ContentPost, TGuide = ContentGuide> =
  | { kind: 'guide'; guide: TGuide; canonicalPath: string }
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

export function supportGuidePath(slug: string): `/${string}` {
  return `/support/${encodeURIComponent(slug)}`;
}

export async function resolveContentSlug<TPost, TGuide>(
  slug: string,
  fetchers: ContentFetchers<TPost, TGuide>
): Promise<ContentSlugResolution<TPost, TGuide>> {
  // Retired ordinals / runes / stamps content always points at its deprecation notice,
  // even where the original post or guide still exists in Sanity.
  const deprecationTarget = getDeprecationTarget(slug);
  if (deprecationTarget) return { kind: 'redirect', location: deprecationTarget };

  const [guide, post] = await Promise.all([fetchers.fetchGuide(slug), fetchers.fetchPost(slug)]);

  // A help center guide is the canonical home for a slug, even when an older post shares it.
  if (guide) return { kind: 'guide', guide, canonicalPath: supportGuidePath(slug) };
  if (post) return { kind: 'post', post, canonicalPath: postPath(slug) };

  // Slugs from the retired Framer/Notion collection that never made it into Sanity.
  const legacyTarget = getLegacyContentTarget(slug);
  if (legacyTarget?.action === 'redirect') return { kind: 'redirect', location: legacyTarget.to };
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
function unservedContentResponse(
  resolution: ContentSlugResolution<unknown, unknown>,
  request: Request
) {
  switch (resolution.kind) {
    case 'guide':
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

export async function loadGuideBySlug<TPost, TGuide>(
  slug: string,
  request: Request,
  fetchers: ContentFetchers<TPost, TGuide>
): Promise<{ guide: TGuide }> {
  const resolution = await resolveContentSlug(slug, fetchers);
  if (resolution.kind === 'guide') return { guide: resolution.guide };
  throw unservedContentResponse(resolution, request);
}

/** Legacy alias routes (`/support/guide/:slug`, `/help-center/...`) never serve content themselves. */
export async function redirectContentSlug<TPost, TGuide>(
  slug: string,
  request: Request,
  fetchers: ContentFetchers<TPost, TGuide>
): Promise<never> {
  const resolution = await resolveContentSlug(slug, fetchers);
  throw unservedContentResponse(resolution, request);
}
