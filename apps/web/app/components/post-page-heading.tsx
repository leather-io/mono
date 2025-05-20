import { Page } from '~/features/page/page';
import { Post } from '~/data/post-types';
import { sanitizeContent } from '~/utils/sanitize-content';

// Universal sanitizer for dynamic content

interface PostPageHeadingProps {
  post: Post;
}

export function PostPageHeading({ post }: PostPageHeadingProps) {
  if (!post) return null;
  return (
    <Page.Heading
      title={sanitizeContent(post.prompt || post.title)}
      subtitle={sanitizeContent(post.sentence || '')}
      disclaimer={sanitizeContent(post.disclaimer || '')}
      postSlug={post.slug}
    />
  );
} 