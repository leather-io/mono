import { Link } from 'react-router';

import { Box } from 'leather-styles/jsx/box';
import { styled } from 'leather-styles/jsx/factory';
import { Flex } from 'leather-styles/jsx/flex';
import { VStack } from 'leather-styles/jsx/vstack';
import Markdown from '~/components/content/markdown-content';
import { cmsClient } from '~/constants/cms-client';
import { Page } from '~/layouts/page/page';

import { LegacyGuideBySlugQueryResult, legacyGuideBySlugQuery } from '@leather.io/cms';

import { Route } from './+types/guide.route';

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
export async function loader({
  params,
}: Route.LoaderArgs): Promise<{ guide: NonNullable<LegacyGuideBySlugQueryResult> }> {
  const { slug } = params;
  // Fetch the guide data using the slug
  const guide = await cmsClient.fetch(legacyGuideBySlugQuery, { slug });

  if (!guide) {
    throw new Error('Guide not found', { cause: 404 });
  }

  return { guide };
}

export default function GuideRoute({ loaderData }: Route.ComponentProps) {
  const { guide } = loaderData;

  return (
    <Page>
      <Page.Header title="Help Center" />

      <Flex
        flexDirection={{ base: 'column', lg: 'row' }}
        gap="space.07"
        my="space.07"
        justifyContent="space-between"
      >
        <Box minWidth="200px" pr={{ base: 'none', lg: 'space.04' }} flex="1">
          <styled.span
            textStyle="label.03"
            border="default"
            borderColor="ink.text-primary"
            color="ink.text-subdued-secondary"
            borderRadius="round"
            borderWidth="thin"
            px="space.02"
            py="space.01"
          >
            {guide.category}
          </styled.span>
          <Page.Title my="space.04">{guide.title}</Page.Title>
          <styled.p textStyle="label.02" color="ink.text-subdued-secondary" mb="space.04">
            {formatDate(guide.createdTime)}
          </styled.p>
          <styled.p textStyle="label.03" color="ink.text-subdued-secondary">
            {guide.disclaimer}
          </styled.p>
        </Box>
        <Box flex="2">
          <Markdown>{guide.body}</Markdown>
          {guide.relatedPosts && guide.relatedPosts.length > 0 && (
            <VStack alignItems="flex-start" gap="space.03" mt="space.06">
              <styled.h3 textStyle="heading.05">Related Guides</styled.h3>
              <styled.ul listStyleType="disc" pl="space.04">
                {guide.relatedPosts.map(post => (
                  <styled.li key={post._id} textStyle="body.01">
                    <Link to={`/support/guide/${post.slug.current}`}>
                      <styled.span
                        color="ink.action-primary-default"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {post.title}
                      </styled.span>
                    </Link>
                  </styled.li>
                ))}
              </styled.ul>
            </VStack>
          )}
        </Box>
      </Flex>
    </Page>
  );
}
