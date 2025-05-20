import { Flex, styled } from 'leather-styles/jsx';
import { Post } from '~/data/post-types';
import { getLearnMoreLink } from '~/features/page/page';
import { styleTokens } from '~/shared/style-tokens';
import { sanitizeContent } from '~/utils/sanitize-content';

interface PostSectionHeadingProps {
  post: Post;
  prefix?: string;
}

export function PostSectionHeading({ post, prefix }: PostSectionHeadingProps) {
  if (!post) return null;
  return (
    <Flex
      flexDir={['column', 'column', 'row']}
      alignItems={['flex-start', 'flex-start', 'flex-start']}
      justifyContent="space-between"
      gap={['space.04', 'space.04', 'space.07']}
      mb="space.07"
      mt="space.07"
    >
      <styled.h2 textStyle="heading.03" maxW="400px" m={0}>
        {prefix}
        {sanitizeContent(post.title)}
      </styled.h2>
      <Flex
        flexDir="column"
        alignItems={['flex-start', 'flex-start', 'flex-end']}
        maxW={['100%', '100%', '60%']}
      >
        <Flex alignItems="flex-start" gap="space.02">
          {post.sentence && (
            <styled.p
              textStyle="body.01"
              mb="space.01"
              display="inline"
              whiteSpace={styleTokens.whiteSpace.preLine}
            >
              {sanitizeContent(post.sentence)}
              {getLearnMoreLink(post.slug, post.sentence)}
            </styled.p>
          )}
        </Flex>
        {post.disclaimer && (
          <>
            <styled.hr
              color="ink.border-default"
              border="none"
              borderBottom="1px solid var(--colors-ink-border-default)"
              width="100%"
              mb="space.02"
              mt="space.03"
            />
            <styled.p textStyle="body.02" color="ink.text-subdued" mb="space.01" borderRadius="sm">
              {sanitizeContent(post.disclaimer)}
            </styled.p>
          </>
        )}
      </Flex>
    </Flex>
  );
}
