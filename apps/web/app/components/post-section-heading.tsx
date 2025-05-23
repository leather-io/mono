import { Box, Flex, styled } from 'leather-styles/jsx';
import { Post } from '~/data/post-types';
import { LearnMoreLink } from '~/features/page/page';
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
      <Box flex={1}>
        <styled.h2 textStyle="heading.03" maxW="400px" m={0} mr="space.03">
          {prefix}
          {sanitizeContent(post.title)}
        </styled.h2>
      </Box>
      <Flex
        flexDir="column"
        alignItems={['flex-start', 'flex-start', 'flex-end']}
        maxW={['100%', '100%', '60%']}
        flex={1}
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
              <LearnMoreLink destination={post.slug} precedingText={post.sentence} />
            </styled.p>
          )}
        </Flex>
        {post.disclaimer && (
          <styled.p textStyle="body.02" color="ink.text-subdued" mb="space.01" borderRadius="sm">
            {sanitizeContent(post.disclaimer)}
          </styled.p>
        )}
      </Flex>
    </Flex>
  );
}
