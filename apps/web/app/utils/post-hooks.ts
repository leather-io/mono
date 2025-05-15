import { content } from '~/data/content';
import { formatPostPrompt, formatPostSentence, formatPostContent } from './post-utils';
import type { Post } from '~/data/post-types';

/**
 * Get a post by its slug
 * @param slug The post slug
 * @returns The post object or undefined if not found
 */
export function usePost(slug: string): Post | undefined {
  return content.posts[slug];
}

/**
 * Get a formatted post prompt by slug
 * @param slug The post slug
 * @returns The formatted prompt or empty string if post not found
 */
export function usePostPrompt(slug: string): string {
  const post = usePost(slug);
  return formatPostPrompt(post?.Prompt);
}

/**
 * Get a formatted post sentence by slug
 * @param slug The post slug
 * @returns The formatted sentence or empty string if post not found
 */
export function usePostSentence(slug: string): string {
  const post = usePost(slug);
  return formatPostSentence(post?.Sentence);
}

/**
 * Get formatted post content by field name and slug
 * @param slug The post slug
 * @param field The field name (e.g., 'Title', 'Body', etc.)
 * @returns The formatted content or empty string if post not found
 */
export function usePostContent(slug: string, field: keyof Post): string {
  const post = usePost(slug);
  if (!post || typeof post[field] !== 'string') return '';
  return formatPostContent(post[field] as string);
} 