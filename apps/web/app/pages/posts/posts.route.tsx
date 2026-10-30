import { type ShouldRevalidateFunctionArgs } from 'react-router';

import { cmsClient, marketingCmsRequestOptions } from '~/constants/cms-client';
import { marketingHeaders, marketingMeta } from '~/pages/marketing/shared/marketing-meta';
import { MarketingPage } from '~/pages/marketing/shared/marketing-page';
import { isDeprecatedContentSlug } from '~/pages/redirects/shared-redirect-logic';

import { type Route } from './+types/posts.route';
import { PostsIndex } from './posts-index';
import {
  type PostsIndexItem,
  postsIndexExcludedCategories,
  postsIndexQuery,
  selectListedPosts,
} from './posts-index.utils';

export const headers = marketingHeaders;

export function meta() {
  return marketingMeta({
    title: 'All posts – Leather',
    path: '/posts',
    description:
      'Stay up to date and read about the latest integrations, partnerships, new features and more from Leather Bitcoin wallet with the Leather blog.',
    image: 'https://leather.io/marketing/posts/og-posts.jpg',
  });
}

export async function loader() {
  try {
    const posts = await cmsClient.fetch<PostsIndexItem[]>(
      postsIndexQuery,
      { excludedCategories: postsIndexExcludedCategories },
      marketingCmsRequestOptions
    );
    return { posts: selectListedPosts(posts ?? [], isDeprecatedContentSlug) };
  } catch (error) {
    // A Sanity outage renders an empty index rather than a 500
    // eslint-disable-next-line no-console
    console.error('Failed to load posts index', error);
    return { posts: [] };
  }
}

// Search only rewrites ?q= on this page and filters client-side; don't refetch Sanity for it.
export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname === nextUrl.pathname) return false;
  return defaultShouldRevalidate;
}

export default function PostsRoute({ loaderData }: Route.ComponentProps) {
  return (
    <MarketingPage title="Posts" showBack>
      <PostsIndex posts={loaderData.posts} />
    </MarketingPage>
  );
}
