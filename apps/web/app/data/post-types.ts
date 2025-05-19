export interface Post {
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
  Images: Array<{ name: string; url: string }>;
  Sentence: string;
  '👁️ Views': string[];
  '📈 Earn providers': any[];
  'Data point instructions': string;
  Aliases: string;
  'Data point source': string;
  Summary: string;
  Website: string;
  Disclaimer: string;
  Order: number;
  Icon: Array<{ name: string; url: string }>;
  'Data point value': string;
  Created_time: string;
}

export interface PostsCollection {
  [slug: string]: Post;
} 