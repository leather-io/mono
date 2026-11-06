import { data, redirect } from 'react-router';

import { type ContentFetchers, redirectContentSlug } from './content-slug-resolver';
import { getLegacyPathTarget } from './legacy-path-redirects';

export async function legacyPathRedirectLoader<TPost, TGuide>(
  request: Request,
  fetchers: ContentFetchers<TPost, TGuide>
) {
  const url = new URL(request.url);
  const target = getLegacyPathTarget(url.pathname);

  if (!target) throw data('The requested page could not be found.', { status: 404 });
  if ('slug' in target) return redirectContentSlug(target.slug, request, fetchers);

  return redirect(`${target.to}${url.search}`, 301);
}
