import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Fetches all posts from the CMS by iterating through all pages
 */
async function fetchAllPosts() {
  const allPosts = [];
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
      
      const data = await response.json();
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
function processPostsForStorage(posts) {
  const postsMap = {};
  
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