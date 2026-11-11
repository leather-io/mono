import { data, redirect } from 'react-router';

import { LEATHER_DOCS } from '~/constants/leather-docs';

import {
  type ContentFetchers,
  redirectContentSlug,
  redirectHelpCenterSlug,
} from './content-slug-resolver';

// Static pages of the old help center that must not be treated as a guide slug.
const supportStaticPaths = new Set(['search']);

function safeDecode(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function splitPath(pathname: string, prefix: string) {
  return pathname.slice(prefix.length).split('/').filter(Boolean).map(safeDecode);
}

function getHelpCenterSlug(segments: string[]) {
  if (segments.length === 2 && segments[0] === 'guide') return segments[1];
  if (segments.length === 1 && !supportStaticPaths.has(segments[0])) return segments[0];
  return null;
}

/**
 * `/help-center/guide/:slug` and `/help-center/:slug` resolve the slug directly to its final
 * URL (one hop): its Leather Docs page, a post, or a deprecation notice. `/help-center/` and the
 * old search page go to the Leather Docs Guides home; any other path is a 404.
 */
export async function helpCenterWildcardLoader<TPost, TGuide>(
  request: Request,
  fetchers: ContentFetchers<TPost, TGuide>
) {
  const url = new URL(request.url);
  const segments = splitPath(url.pathname, '/help-center');

  if (segments.length === 0 || (segments.length === 1 && supportStaticPaths.has(segments[0]))) {
    return redirect(`${LEATHER_DOCS.guides}${url.search}`, 301);
  }

  const slug = getHelpCenterSlug(segments);
  if (slug) return redirectHelpCenterSlug(slug, request, fetchers);

  throw data('The requested page could not be found.', { status: 404 });
}

/** Framer forwarded leather.io/guides/:slug to /posts/:slug. */
export async function guidesWildcardLoader<TPost, TGuide>(
  request: Request,
  fetchers: ContentFetchers<TPost, TGuide>
) {
  const url = new URL(request.url);
  const segments = splitPath(url.pathname, '/guides');

  if (segments.length === 1) return redirectContentSlug(segments[0], request, fetchers);
  if (segments.length === 0) return redirect(`${LEATHER_DOCS.guides}${url.search}`, 301);

  throw data('The requested page could not be found.', { status: 404 });
}
