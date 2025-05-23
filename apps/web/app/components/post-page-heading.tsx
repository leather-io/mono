import { styled } from 'leather-styles/jsx';
import { Post } from '~/data/post-types';
import { LearnMoreLink, Page } from '~/features/page/page';
import { sanitizeContent } from '~/utils/sanitize-content';

interface PostPageHeadingProps {
  post: Post;
}
export function PostPageHeading({ post }: PostPageHeadingProps) {
  if (!post) return null;
  const subtitle = sanitizeContent(post.sentence ?? '');
  const disclaimer = post.disclaimer ? sanitizeContent(post.disclaimer) : null;

  return (
    <Page.Heading
      title={sanitizeContent(post.prompt ?? post.title)}
      subtitle={
        <>
          {subtitle}
          <LearnMoreLink destination={post.slug} precedingText={post.sentence} />
          {disclaimer && (
            <styled.p
              textStyle="caption.01"
              color="ink.text-subdued"
              mt="space.02"
              borderRadius="sm"
            >
              {disclaimer}
            </styled.p>
          )}
        </>
      }
    />
  );
}
