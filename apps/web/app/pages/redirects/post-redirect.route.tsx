import { type Route } from './+types/post-redirect.route';
import { redirectPostSlug } from './content-slug-resolver';

// Posts are retired: /posts/:slug 301s to the page that replaced the post (Leather Docs, /apps or
// a legal page), or to the Leather Docs blog.
export function loader({ params, request }: Route.LoaderArgs) {
  return redirectPostSlug(params.slug, request);
}

export default function PostRedirectRoute() {
  return null;
}
