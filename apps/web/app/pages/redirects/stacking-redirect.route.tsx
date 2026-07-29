import { Route } from './+types/stacking-redirect.route';
import { stackingRedirectLoader } from './shared-redirect-logic';

export function loader({ request }: Route.LoaderArgs) {
  return stackingRedirectLoader(request);
}
