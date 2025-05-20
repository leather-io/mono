import { styled } from 'leather-styles/jsx';
import { Post } from '~/data/post-types';
import { Page, getLearnMoreLink } from '~/features/page/page';
import { sanitizeContent } from '~/utils/sanitize-content';

interface PostPageHeadingProps {
  post: Post;
}

export function PostPageHeading({ post }: PostPageHeadingProps) {
  if (!post) return null;
  const subtitle = sanitizeContent(post.sentence ?? '');
  const disclaimer = post.disclaimer ? sanitizeContent(post.disclaimer) : null;
  const learnMoreLink = getLearnMoreLink(post.slug, post.sentence);
  return (
    <Page.Heading
      title={sanitizeContent(post.prompt ?? post.title)}
      subtitle={
        <>
          {subtitle}
          {learnMoreLink}
        </>
      }
    >
      {disclaimer && (
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.02" borderRadius="sm">
          {disclaimer}
        </styled.p>
      )}
    </Page.Heading>
  );
}
