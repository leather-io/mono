import { redirect } from 'react-router';

import { Route } from './+types/support-guide-redirect.route';

export function loader({ params }: Route.LoaderArgs) {
  return redirect(`/support/${params.slug}`, 301);
}
