import { type Route } from './+types/support-guide-redirect.route';
import { cmsContentFetchers, redirectHelpCenterSlug } from './content-slug-resolver';

export { ContentErrorBoundary as ErrorBoundary } from './content-error-boundary';
export { contentMeta as meta } from './content-error-boundary';

// The retired help center guide URLs, `/support/:slug` and `/support/guide/:slug`, never serve
// content: they 301 straight to the slug's final URL (usually its Leather Docs page), or 404.
export async function loader({ params, request }: Route.LoaderArgs) {
  return redirectHelpCenterSlug(params.slug, request, cmsContentFetchers);
}

export default function SupportGuideRedirectRoute() {
  return null;
}
