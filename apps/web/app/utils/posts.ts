import { content } from '../data/content';
import type { Post } from '../data/post-types';

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