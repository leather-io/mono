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
  images: Array<{ name: string; url: string }>;
  sentence: string;
  views: string[];
  earnProviders: any[];
  dataPointInstructions: string;
  aliases: string;
  dataPointSource: string;
  summary: string;
  website: string;
  disclaimer: string;
  order: number;
  icon: Array<{ name: string; url: string }>;
  dataPointValue: string;
  createdTime: string;
}

export interface PostsCollection {
  [slug: string]: Post;
}

// Utility to convert raw post objects from PascalCase to camelCase
export function normalizePost(raw: any): Post {
  return {
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
    earnProviders: raw['📈 Earn providers'],
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
}

export function normalizePosts(rawPosts: Record<string, any>): PostsCollection {
  const normalized: PostsCollection = {};
  for (const slug in rawPosts) {
    normalized[slug] = normalizePost(rawPosts[slug]);
  }
  return normalized;
} 