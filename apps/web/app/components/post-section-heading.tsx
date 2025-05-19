import { styled, Flex } from 'leather-styles/jsx';
import { Post } from '~/data/post-types';
import { getLearnMoreLink } from '~/features/page/page';
import { sanitizeContent } from '~/utils/sanitize-content';

interface PostSectionHeadingProps {
  post: Post;
  prefix?: string;
}

export function PostSectionHeading({ post, prefix }: PostSectionHeadingProps) {
  if (!post) return null;
  return (
    <Flex
      flexDir={["column", "column", "row"]}
      alignItems={["flex-start", "flex-start", "flex-start"]}
      justifyContent="space-between"
      gap={["space.04", "space.04", "space.07"]}
      mb="space.07"
      mt="space.07"
    >
      <styled.h2 textStyle="heading.03" maxW="400px" m={0}>
        {prefix}
        {sanitizeContent(post.Title)}
      </styled.h2>
      <Flex flexDir="column" alignItems={["flex-start", "flex-start", "flex-end"]} maxW={["100%", "100%", "60%"]}>
        <Flex alignItems="flex-start" gap="space.02">
          {post.Sentence && (
            <styled.p textStyle="body.01" mb="space.01" display="inline" style={{ whiteSpace: 'pre-line' }}>
              {sanitizeContent(post.Sentence)}
              {getLearnMoreLink(post.Slug, post.Sentence)}
            </styled.p>
          )}
            
        </Flex>
        {post.Disclaimer && (
          <>
            <styled.hr color="ink.border-default" border="none" borderBottom="1px solid var(--colors-ink-border-default)" width="100%" mb="space.02" mt="space.03" />
            <styled.p textStyle="body.02" color="ink.text-subdued" mb="space.01" borderRadius="sm">{sanitizeContent(post.Disclaimer)}</styled.p>
          </>
        )}
      </Flex>
    </Flex>
  );
} 