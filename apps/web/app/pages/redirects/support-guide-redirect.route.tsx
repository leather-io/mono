import { type Route } from './+types/support-guide-redirect.route';
import { cmsContentFetchers, redirectContentSlug } from './content-slug-resolver';

export { ContentErrorBoundary as ErrorBoundary } from './content-error-boundary';
export { contentMeta as meta } from './content-error-boundary';

// `/support/guide/:slug` never serves content: it 301s straight to the slug's final URL, or 404s.
export async function loader({ params, request }: Route.LoaderArgs) {
  return redirectContentSlug(params.slug, request, cmsContentFetchers);
}

export default function SupportGuideRedirectRoute() {
  return null;
}
