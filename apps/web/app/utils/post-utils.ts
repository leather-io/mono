import { removeTrailingPeriod } from './string-utils';
import { content } from '~/data/content';
import type { Post } from '~/data/post-types';

// --------------------
// Formatting Helpers
// --------------------

/**
 * Get a formatted post prompt without trailing periods
 * @param prompt The prompt content from a post
 * @returns The formatted prompt
 */
export function formatPostPrompt(prompt: string | undefined | null): string {
  return removeTrailingPeriod(prompt);
}

/**
 * Get a formatted post sentence without trailing periods
 * @param sentence The sentence content from a post
 * @returns The formatted sentence
 */
export function formatPostSentence(sentence: string | undefined | null): string {
  return removeTrailingPeriod(sentence);
}

/**
 * Formats any post text content by removing trailing periods
 * @param text Any text content from a post
 * @returns The formatted text
 */
export function formatPostContent(text: string | undefined | null): string {
  return removeTrailingPeriod(text);
}

// --------------------
// React Hooks
// --------------------

/**
 * Get a post by its slug (hook)
 */
export function usePost(slug: string): Post | undefined {
  return content.posts[slug];
}

/**
 * Get a formatted post prompt by slug (hook)
 */
export function usePostPrompt(slug: string): string {
  const post = usePost(slug);
  return formatPostPrompt(post?.Prompt);
}

/**
 * Get a formatted post sentence by slug (hook)
 */
export function usePostSentence(slug: string): string {
  const post = usePost(slug);
  return formatPostSentence(post?.Sentence);
}

/**
 * Get formatted post content by field name and slug (hook)
 */
export function usePostContent(slug: string, field: keyof Post): string {
  const post = usePost(slug);
  if (!post || typeof post[field] !== 'string') return '';
  return formatPostContent(post[field] as string);
}

// --------------------
// Non-hook Post Utilities
// --------------------

/**
 * Get a post by its slug
 */
export function getPostBySlug(slug: string): Post | undefined {
  return content.posts[slug];
}

/**
 * Get all posts
 */
export function getAllPosts(): Post[] {
  return Object.values(content.posts);
}

/**
 * Get posts filtered by a specific category
 */
export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter(post => post.Category === category);
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(): Post[] {
  return getAllPosts().filter(post => post.Featured);
}

/**
 * Get non-hidden posts
 */
export function getVisiblePosts(): Post[] {
  return getAllPosts().filter(post => !post.Hidden);
} 