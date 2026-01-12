import { MetaDescriptor } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { cmsClient } from '~/constants/cms-client';
import { Page } from '~/layouts/page/page';
import { SimpleGuideList } from '~/pages/support/components/simple-guide-list';
import { SupportFormProvider } from '~/pages/support/components/support-form-provider';
import { handleSupportFormAction } from '~/utils/support/support-form-action';

import {
  LegacyHelpCenterCategoryBySlugQueryResult,
  legacyHelpCenterCategoryBySlugQuery,
} from '@leather.io/cms';

import { Route } from './+types/category-guides.route';

export function meta() {
  return [
    { title: 'Guides – Leather' },
    { name: 'description', content: 'Leather wallet user guides for every stage' },
  ] satisfies MetaDescriptor[];
}

export async function action({ request }: Route.ActionArgs) {
  return handleSupportFormAction(request);
}

export async function loader({ params }: Route.LoaderArgs): Promise<{
  data: NonNullable<LegacyHelpCenterCategoryBySlugQueryResult>;
}> {
  const data = await cmsClient.fetch(legacyHelpCenterCategoryBySlugQuery, { slug: params.slug });

  if (!data) {
    throw new Error('Guides not found', { cause: 404 });
  }

  return {
    data,
  };
}

export default function SectionPostsRoute({ loaderData }: Route.ComponentProps) {
  const { data } = loaderData;
  return (
    <Page>
      <Page.Header title="Help Center" />
      <styled.div
        pos="relative"
        bg="black"
        color="white"
        h="280px"
        backgroundImage="url(/images/guides-hero.png)"
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        backgroundPosition="center"
      />
      <Page.Title my="space.06">{data.categoryName}</Page.Title>
      <Flex mt="space.07" flexDirection={{ lg: 'row', md: 'column', sm: 'column' }} flexWrap="wrap">
        <Box mb="space.05" flex="2" maxWidth="900px">
          <SimpleGuideList
            items={data.guides.map(post => ({
              id: post._id,
              title: post.title,
              href: `/support/guide/${post.slug.current}`,
            }))}
          />
        </Box>
        <Box
          maxWidth="400px"
          mb="space.07"
          ml={{ lg: 'space.10', sm: 'none' }}
          flex="1"
          flexDirection="column"
        >
          <SupportFormProvider />
        </Box>
      </Flex>
    </Page>
  );
}
