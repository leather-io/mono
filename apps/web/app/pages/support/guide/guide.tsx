import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router';

import { Box } from 'leather-styles/jsx/box';
import { styled } from 'leather-styles/jsx/factory';
import { Flex } from 'leather-styles/jsx/flex';
import { VStack } from 'leather-styles/jsx/vstack';
import { Breadcrumb } from '~/components/breadcrumb';
import Markdown from '~/components/content/markdown-content';
import { Page } from '~/layouts/page/page';
import { RelatedGuides } from '~/pages/support/components/related-guides';
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

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}

export function Guide() {
  const { guide } = useLoaderData<typeof loader>();
  const progress = useScrollProgress();

  return (
    <Page>
      <Box position="sticky" top={0} zIndex={40} bg="ink.background-primary">
        <Page.Header title="Help Center" />
        <Box height="3px" width="100%">
          <Box
            height="100%"
            bg="ink.text-primary"
            style={{ width: `${progress * 100}%` }}
            transition="width 0.1s linear"
          />
        </Box>
      </Box>

      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap="space.10" my="space.07">
        <Box minWidth="200px" flex="1" maxWidth={{ lg: '380px' }}>
          <Breadcrumb
            segments={[
              { label: 'Help & Support', href: '/support' },
              { label: guide.categories[0]?.name ?? '' },
            ]}
          />
          <Page.Title my="space.04">{guide.title}</Page.Title>
          <styled.p textStyle="label.02" color="ink.text-primary" mb="space.04">
            {guide.summary}
          </styled.p>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {formatDate(guide.publishedAt)}
          </styled.p>
        </Box>
        <Box flex="2">
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
