import { content } from '~/data/content';
import type { Post, PostsCollection } from '~/data/post-types';

import { removeTrailingPeriod } from './string-utils';

// --------------------
// Formatting Helpers
// --------------------

/**
 * Converts kebab-case strings to camelCase
 * @param str The string in kebab-case format
 * @returns The string in camelCase format
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

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

/**
 * Safe access to the posts collection with proper typing
 * @returns The validated posts collection
 */
export function getPosts(): PostsCollection {
  return content.posts;
}

/**
 * Get a post by its key, automatically converting from kebab-case to camelCase if needed
 * @param key The post key in kebab-case or camelCase
 * @returns The post if found, undefined otherwise
 */
export function getPostByKey(key: string): Post | undefined {
  const posts = getPosts();
  // Try direct access first
  if (posts[key]) return posts[key];

  // Try converting to camelCase if it looks like a kebab-case key
  if (key.includes('-')) {
    const camelCaseKey = toCamelCase(key);
    return posts[camelCaseKey];
  }

  return undefined;
}

// --------------------
// React Hooks
// --------------------

/**
 * Get a post by its slug (hook)
 */
export function usePost(slug: string): Post | undefined {
  return getPostByKey(slug);
}

/**
 * Get a formatted post prompt by slug (hook)
 */
export function usePostPrompt(slug: string): string {
  const post = usePost(slug);
  return formatPostPrompt(post?.prompt);
}

/**
 * Get a formatted post sentence by slug (hook)
 */
export function usePostSentence(slug: string): string {
  const post = usePost(slug);
  return formatPostSentence(post?.sentence);
}

/**
 * Get formatted post content by field name and slug (hook)
 */
export function usePostContent(slug: string, field: keyof Post): string {
  const post = usePost(slug);
  if (!post || typeof post[field] !== 'string') return '';
  return formatPostContent(post[field]);
}

// --------------------
// Non-hook Post Utilities
// --------------------

/**
 * Get a post by its slug
 */
export function getPostBySlug(slug: string): Post | undefined {
  return getPostByKey(slug);
}

/**
 * Get all posts
 */
export function getAllPosts(): Post[] {
  return Object.values(getPosts());
}

/**
 * Get posts filtered by a specific category
 */
export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter(post => post.category === category);
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(): Post[] {
  return getAllPosts().filter(post => post.featured);
}

/**
 * Get non-hidden posts
 */
export function getVisiblePosts(): Post[] {
  return getAllPosts().filter(post => !post.hidden);
}
