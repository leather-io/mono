import { data, redirect } from 'react-router';

import { LEATHER_DOCS } from '~/constants/leather-docs';

import { type ContentFetchers, redirectContentSlug } from './content-slug-resolver';
import { getLegacyPathTarget } from './legacy-path-redirects';

export async function legacyPathRedirectLoader(request: Request, fetchers: ContentFetchers) {
  const url = new URL(request.url);
  const target = getLegacyPathTarget(url.pathname);

  if (!target) throw data('The requested page could not be found.', { status: 404 });
  if ('slug' in target) return redirectContentSlug(target.slug, request, fetchers);
  if ('docs' in target) return redirect(`${LEATHER_DOCS[target.docs]}${url.search}`, 301);

  return redirect(`${target.to}${url.search}`, 301);
}
