# Leather CMS Posts Integration

This directory contains the integration with Leather's CMS system for blog posts and other content.

## Overview

The system fetches posts from the CMS API at https://cms.leather.io/posts and stores them as a static JSON file in the repository. This allows the application to access the content without making API calls at runtime.

## Files

- `content.ts` - The main content file that exports all content including posts
- `posts.json` - The static JSON file containing all posts from the CMS
- `post-types.ts` - TypeScript type definitions for post data

## Fetching Posts

To update the posts data from the CMS:

```bash
# From the apps/web directory
./fetch-posts.sh
```

This will:
1. Run the fetch-posts.js script
2. Iterate through all pages of posts in the CMS
3. Save them to posts.json indexed by their slug

## Using Posts in Code

Import the utility functions from `utils/posts.ts`:

```typescript
import { getPostBySlug, getAllPosts, getPostsByCategory } from '../utils/posts';

// Get a specific post by slug
const post = getPostBySlug('my-post-slug');

// Get all posts
const allPosts = getAllPosts();

// Get posts by category
const explainers = getPostsByCategory('Explainers');
```

Or access directly through the content object:

```typescript
import { content } from '../data/content';

// Access a post by slug
const post = content.posts['my-post-slug'];
```

## Post Structure

Each post has the following structure:

```typescript
interface Post {
  id: string;
  Title: string;
  Slug: string;
  Body: string;
  Date: string;
  Status: string;
  Category: string;
  Subcategory: string;
  Featured: boolean;
  Hidden: boolean;
  // ...and more fields
}
```

See `post-types.ts` for the complete type definition.

## Testing

A test page is available at `/test-posts` that demonstrates the posts are being loaded and shows basic post information. This is a good place to verify that the CMS integration is working correctly after fetching new posts. 