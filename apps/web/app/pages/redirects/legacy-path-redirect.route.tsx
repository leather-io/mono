import { type Route } from './+types/legacy-path-redirect.route';
import { cmsContentFetchers } from './content-slug-resolver';
import { legacyPathRedirectLoader } from './legacy-path-redirect-loader';

export { ContentErrorBoundary as ErrorBoundary } from './content-error-boundary';
export { contentMeta as meta } from './content-error-boundary';

// Shared by every entry in `legacyPathRedirects` (old Framer redirect table).
export async function loader({ request }: Route.LoaderArgs) {
  return legacyPathRedirectLoader(request, cmsContentFetchers);
}

export default function LegacyPathRedirectRoute() {
  return null;
}
