import { Box } from 'leather-styles/jsx/box';
import { styled } from 'leather-styles/jsx/factory';
import { Flex } from 'leather-styles/jsx/flex';
import { Breadcrumb } from '~/components/breadcrumb';
import Markdown from '~/components/content/markdown-content';
import { cmsClient } from '~/constants/cms-client';
import { Page } from '~/layouts/page/page';
import { RelatedGuides } from '~/pages/support/components/related-guides';

import { HelpCenterGuideBySlugQueryResult, helpCenterGuideBySlugQuery } from '@leather.io/cms';

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
export async function loader({ params }: Route.LoaderArgs): Promise<{
  guide: NonNullable<HelpCenterGuideBySlugQueryResult>;
  categorySlug: string;
}> {
  const { guideSlug, categorySlug } = params;
  // Fetch the guide data using the slug
  const guide = await cmsClient.fetch(helpCenterGuideBySlugQuery, { slug: guideSlug });

  if (!guide) {
    throw new Error('Guide not found', { cause: 404 });
  }

  return { guide, categorySlug };
}

export default function GuideRoute({ loaderData }: Route.ComponentProps) {
  const { guide, categorySlug } = loaderData;
  const category =
    guide.categories?.find(c => c.slug.current === categorySlug) ?? guide.categories?.[0];

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
          <Breadcrumb
            segments={[
              { label: 'Home', href: '/support' },
              { label: category.name, href: `/support/${category.slug.current}` },
            ]}
          />
          <Page.Title textStyle="heading.03" my="space.04">
            {guide.title}
          </Page.Title>
          <styled.p textStyle="caption.01" color="ink.text-subdued" mb="space.04">
            {formatDate(guide.publishedAt)}
          </styled.p>
        </Box>
        <Box flex="2">
          <Markdown>{guide.body}</Markdown>
          {guide.relatedGuides && guide.relatedGuides.length > 0 && (
            <RelatedGuides categorySlug={category.slug.current} guides={guide.relatedGuides} />
          )}
          <styled.h5 textStyle="heading.05" mt="space.07" pb="space.04">
            Disclaimer
          </styled.h5>
          <styled.p textStyle="label.03" color="ink.text-subdued">
            {guide.disclaimer}
          </styled.p>
        </Box>
      </Flex>
    </Page>
  );
}
