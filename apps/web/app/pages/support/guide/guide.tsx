import { useRef } from 'react';
import { useLoaderData } from 'react-router';

import { Box } from 'leather-styles/jsx/box';
import { styled } from 'leather-styles/jsx/factory';
import { Flex } from 'leather-styles/jsx/flex';
import { VStack } from 'leather-styles/jsx/vstack';
import { Breadcrumb } from '~/components/breadcrumb';
import Markdown from '~/components/content/markdown-content';
import { Page } from '~/layouts/page/page';
import { RelatedGuides } from '~/pages/support/components/related-guides';
import { ReadingProgress } from '~/pages/support/guide/components/reading-progress';
import { loader } from '~/pages/support/guide/guide.route';

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

export function Guide() {
  const { guide } = useLoaderData<typeof loader>();
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Page>
      <Box position="sticky" top={0} zIndex={1} bg="ink.background-primary">
        <Page.Header title="Help Center" />
        <ReadingProgress targetRef={contentRef} />
      </Box>

      <Flex
        ref={contentRef}
        flexDirection={{ base: 'column', lg: 'row' }}
        gap="space.10"
        mt="space.07"
        mb="space.09"
      >
        <Box minWidth="200px" flex="1" maxWidth={{ lg: '380px' }}>
          <Breadcrumb
            segments={[
              { label: 'Help & Support', href: '/support' },
              { label: guide.categories[0]?.name ?? '' },
            ]}
          />
          <Page.Title textStyle="heading.03" mt="space.05" mb="space.05">
            {guide.title}
          </Page.Title>
          <styled.p textStyle="label.02" color="ink.text-primary" mb="space.05">
            {guide.summary}
          </styled.p>
          <styled.p textStyle="label.03" color="ink.text-subdued">
            {formatDate(guide.publishedAt)}
          </styled.p>
        </Box>
        <Box
          flex="2"
          mt={{ base: 0, lg: 'space.08' }}
          css={{
            '& > *:first-child': {
              lg: { marginTop: 0 },
            },
          }}
        >
          <Markdown>{guide.body}</Markdown>
          {guide.relatedGuides && guide.relatedGuides.length > 0 && (
            <RelatedGuides guides={guide.relatedGuides} />
          )}
          {guide.disclaimer && (
            <VStack alignItems="flex-start" gap="space.05" mt="space.09">
              <styled.h3 textStyle="heading.05">Disclaimer</styled.h3>
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                {guide.disclaimer}
              </styled.p>
            </VStack>
          )}
        </Box>
      </Flex>
    </Page>
  );
}
