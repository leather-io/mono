import { marketingMeta } from '~/pages/marketing/shared/marketing-meta';
import { Post } from '~/pages/posts/post';
import { contentMeta } from '~/pages/redirects/content-error-boundary';
import {
  type ContentPost,
  cmsContentFetchers,
  loadPostBySlug,
  postPath,
} from '~/pages/redirects/content-slug-resolver';

import { type Route } from './+types/post.route';

export { ContentErrorBoundary as ErrorBoundary } from '~/pages/redirects/content-error-boundary';

export function meta({ loaderData, error, params }: Route.MetaArgs) {
  if (!loaderData) return contentMeta({ error });
  const { post } = loaderData;
  return marketingMeta({
    title: `${post.title} – Leather`,
    path: postPath(params.postSlug),
    // `sentence` is the one-line teaser; `summary` is a paragraph
    description: post.sentence || post.summary || undefined,
  });
}

export async function loader({
  params,
  request,
}: Route.LoaderArgs): Promise<{ post: ContentPost }> {
  return loadPostBySlug(params.postSlug, request, cmsContentFetchers);
}

export default function PostRoute() {
  return <Post />;
}
