import { useLoaderData } from 'react-router';

import { Box } from 'leather-styles/jsx/box';
import { styled } from 'leather-styles/jsx/factory';
import { Flex } from 'leather-styles/jsx/flex';
import { VStack } from 'leather-styles/jsx/vstack';
import Markdown from '~/components/content/markdown-content';
import { Page } from '~/layouts/page/page';
import { loader } from '~/pages/posts/post.route';

function formatDate(dateString: string | undefined) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return formatter.format(date);
}

export function Post() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <Page>
      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap="space.10" my="space.07">
        <Box minWidth="200px" flex="1" maxWidth={{ lg: '380px' }}>
          <Page.Title my="space.04">{post.title}</Page.Title>
          <styled.p textStyle="label.02" color="ink.text-primary" mb="space.04">
            {post.summary}
          </styled.p>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {formatDate(post.publishedAt)}
          </styled.p>
        </Box>
        <Box flex="2">
          <Markdown>{post.body}</Markdown>
          {post.disclaimer && (
            <VStack alignItems="flex-start" gap="space.05" mt="space.09">
              <styled.h3 textStyle="heading.05">Disclaimer</styled.h3>
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                {post.disclaimer}
              </styled.p>
            </VStack>
          )}
        </Box>
      </Flex>
    </Page>
  );
}
