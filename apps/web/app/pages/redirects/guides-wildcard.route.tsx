import { type Route } from './+types/guides-wildcard.route';
import { cmsContentFetchers } from './content-slug-resolver';
import { guidesWildcardLoader } from './legacy-prefix-redirects';

export { ContentErrorBoundary as ErrorBoundary } from './content-error-boundary';
export { contentMeta as meta } from './content-error-boundary';

// Framer used to forward leather.io/guides/:slug to /posts/:slug.
export async function loader({ request }: Route.LoaderArgs) {
  return guidesWildcardLoader(request, cmsContentFetchers);
}

export default function GuidesWildcardRoute() {
  return null;
}
