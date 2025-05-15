import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

interface PaginatedResponse {
  posts: Post[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Fetches all posts from the CMS by iterating through all pages
 */
async function fetchAllPosts(): Promise<Post[]> {
  const allPosts: Post[] = [];
  let currentPage = 1;
  let hasNextPage = true;
  
  console.log('Fetching posts from CMS...');
  
  while (hasNextPage) {
    try {
      console.log(`Fetching page ${currentPage}...`);
      const response = await fetch(`https://cms.leather.io/posts?page=${currentPage}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }
      
      const data: PaginatedResponse = await response.json();
      allPosts.push(...data.posts);
      
      hasNextPage = data.pagination.hasNextPage;
      currentPage++;
      
      console.log(`Fetched ${data.posts.length} posts from page ${currentPage - 1}`);
    } catch (error) {
      console.error('Error fetching posts:', error);
      hasNextPage = false;
    }
  }
  
  console.log(`Fetched a total of ${allPosts.length} posts`);
  return allPosts;
}

/**
 * Processes posts and converts them to a format indexed by slug
 */
function processPostsForStorage(posts: Post[]): Record<string, Post> {
  const postsMap: Record<string, Post> = {};
  
  posts.forEach(post => {
    // Skip posts without a slug
    if (!post.Slug) {
      console.warn(`Post with ID ${post.id} has no slug, skipping`);
      return;
    }
    
    // If we already have a post with this slug, only keep the most recently created one
    if (postsMap[post.Slug]) {
      const existingPostDate = new Date(postsMap[post.Slug].Created_time);
      const currentPostDate = new Date(post.Created_time);
      
      if (currentPostDate > existingPostDate) {
        postsMap[post.Slug] = post;
      }
    } else {
      postsMap[post.Slug] = post;
    }
  });
  
  return postsMap;
}

/**
 * Main function to fetch posts and save them to a JSON file
 */
async function main() {
  try {
    const posts = await fetchAllPosts();
    const processedPosts = processPostsForStorage(posts);
    
    // Get the directory of the current module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Path to save the JSON file
    const outputDir = path.resolve(__dirname, '../data');
    const outputPath = path.join(outputDir, 'posts.json');
    
    // Ensure the directory exists
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Write the posts to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(processedPosts, null, 2));
    
    console.log(`Successfully saved ${Object.keys(processedPosts).length} posts to ${outputPath}`);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run the script
main(); 