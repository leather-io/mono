import { z } from 'zod';

export interface Post {
  id: string;
  title: string;
  slug: string;
  body: string;
  date: string;
  status: string;
  category: string;
  subcategory: string;
  featured: boolean;
  hidden: boolean;
  question: string;
  prompt: string;
  images: ImageAsset[];
  sentence: string;
  views: string[];
  earnProviders: EarnProvider[];
  dataPointInstructions: string;
  aliases: string;
  dataPointSource: string;
  summary: string;
  website: string;
  disclaimer: string;
  order: number;
  icon: ImageAsset[];
  dataPointValue: string;
  createdTime: string;
}

export interface ImageAsset {
  name: string;
  url: string;
}

export interface EarnProvider {
  name: string;
  id: string;
}

// Define a type for raw post data with PascalCase properties
export interface RawPost {
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
  Question: string;
  Prompt: string;
  Images: ImageAsset[];
  Sentence: string;
  '👁️ Views': string[];
  '📈 Earn providers'?: EarnProvider[];
  'Data point instructions': string;
  Aliases: string;
  'Data point source': string;
  Summary: string;
  Website: string;
  Disclaimer: string;
  Order: number;
  Icon: ImageAsset[];
  'Data point value': string;
  Created_time: string;
}

export interface PostsCollection {
  [slug: string]: Post;
}

// Zod schema for ImageAsset
export const imageAssetSchema = z.object({
  name: z.string(),
  url: z.string().url()
});

// Zod schema for EarnProvider
export const earnProviderSchema = z.object({
  name: z.string(),
  id: z.string()
});

// Zod schema for Post
export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  date: z.string(),
  status: z.string(),
  category: z.string(),
  subcategory: z.string(),
  featured: z.boolean(),
  hidden: z.boolean(),
  question: z.string(),
  prompt: z.string(),
  images: z.array(imageAssetSchema),
  sentence: z.string(),
  views: z.array(z.string()),
  earnProviders: z.array(earnProviderSchema).optional().default([]),
  dataPointInstructions: z.string(),
  aliases: z.string(),
  dataPointSource: z.string(),
  summary: z.string(),
  website: z.string(),
  disclaimer: z.string(),
  order: z.number(),
  icon: z.array(imageAssetSchema),
  dataPointValue: z.string(),
  createdTime: z.string()
});

export const postsCollectionSchema = z.record(z.string(), postSchema);

// Helper function to convert kebab-case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

// Utility to convert raw post objects from PascalCase to camelCase
export function normalizePost(rawData: unknown): Post {
  // Cast the unknown data to RawPost type
  const raw = rawData as RawPost;
  
  const normalizedPost = {
    id: raw.id,
    title: raw.Title,
    slug: raw.Slug,
    body: raw.Body,
    date: raw.Date,
    status: raw.Status,
    category: raw.Category,
    subcategory: raw.Subcategory,
    featured: raw.Featured,
    hidden: raw.Hidden,
    question: raw.Question,
    prompt: raw.Prompt,
    images: raw.Images,
    sentence: raw.Sentence,
    views: raw['👁️ Views'],
    earnProviders: raw['📈 Earn providers'] || [],
    dataPointInstructions: raw['Data point instructions'],
    aliases: raw.Aliases,
    dataPointSource: raw['Data point source'],
    summary: raw.Summary,
    website: raw.Website,
    disclaimer: raw.Disclaimer,
    order: raw.Order,
    icon: raw.Icon,
    dataPointValue: raw['Data point value'],
    createdTime: raw.Created_time,
  };
  
  // Validate the post with Zod
  return postSchema.parse(normalizedPost);
}

export function normalizePosts(rawPosts: Record<string, unknown>): PostsCollection {
  const normalized: PostsCollection = {};
  for (const slug in rawPosts) {
    const camelCaseKey = toCamelCase(slug);
    normalized[camelCaseKey] = normalizePost(rawPosts[slug]);
  }
  return normalized;
} 