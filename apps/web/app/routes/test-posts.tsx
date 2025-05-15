import { getAllPosts, getPostBySlug, getPostsByCategory } from '../utils/posts';

export default function TestPosts() {
  const allPosts = getAllPosts();
  const testPost = getPostBySlug('test-post');
  const explainers = getPostsByCategory('Explainers');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Posts Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Post Statistics</h2>
        <p>Total posts: {allPosts.length}</p>
        <p>Explainers category posts: {explainers.length}</p>
      </div>

      {testPost && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Sample Post: {testPost.Title}</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Slug:</strong> {testPost.Slug}</p>
            <p><strong>Date:</strong> {testPost.Date}</p>
            <p><strong>Status:</strong> {testPost.Status}</p>
            <p><strong>Category:</strong> {testPost.Category}</p>
            <p><strong>Summary:</strong> {testPost.Summary}</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">All Posts</h2>
        <ul className="list-disc pl-6">
          {allPosts.slice(0, 20).map(post => (
            <li key={post.id} className="mb-1">
              {post.Title} ({post.Slug})
            </li>
          ))}
          {allPosts.length > 20 && <li>...and {allPosts.length - 20} more</li>}
        </ul>
      </div>
    </div>
  );
} 