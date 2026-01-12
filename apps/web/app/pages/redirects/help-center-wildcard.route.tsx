import { Route } from './+types/help-center-wildcard.route';
import { helpCenterRedirectLoader } from './shared-redirect-logic';

export function loader({ request }: Route.LoaderArgs) {
  return helpCenterRedirectLoader(request);
}
