import { type Route } from './+types/help-center-wildcard.route';
import { cmsContentFetchers } from './content-slug-resolver';
import { helpCenterWildcardLoader } from './legacy-prefix-redirects';

export { ContentErrorBoundary as ErrorBoundary } from './content-error-boundary';
export { contentMeta as meta } from './content-error-boundary';

export async function loader({ request }: Route.LoaderArgs) {
  return helpCenterWildcardLoader(request, cmsContentFetchers);
}

export default function HelpCenterWildcardRoute() {
  return null;
}
