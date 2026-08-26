import { cmsClient } from '~/constants/cms-client';
import { Post } from '~/pages/posts/post';
import { getDeprecationRedirect } from '~/pages/redirects/shared-redirect-logic';

import { PostBySlugQueryResult, postBySlugQuery } from '@leather.io/cms';

import { Route } from './+types/post.route';

export async function loader({
  params,
}: Route.LoaderArgs): Promise<{ post: NonNullable<PostBySlugQueryResult> } | Response> {
  const slug = params.postSlug;

  const deprecationRedirect = getDeprecationRedirect(slug);
  if (deprecationRedirect) return deprecationRedirect;

  const post = await cmsClient.fetch(postBySlugQuery, { slug });

  if (!post) {
    throw new Error('Post not found', { cause: 404 });
  }

  return { post };
}

export default function PostRoute() {
  return <Post />;
}
