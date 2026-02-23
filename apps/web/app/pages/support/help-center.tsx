import { useLoaderData } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';
import { GuideList } from '~/pages/support/components/guide-list';
import { SupportFormProvider } from '~/pages/support/components/support-form-provider';
import { loader } from '~/pages/support/help-center.route';

import type { SanityImageAsset } from '@leather.io/cms';

export function HelpCenter() {
  const { categories } = useLoaderData<typeof loader>();

  if (!categories) return null;

  return (
    <Page>
      <Page.Header title="Help Center" />

      <Page.Heading
        title="How can we help?"
        subtitle={
          <styled.p>
            Whether you're just getting started or you're deep into development, you'll find
            everything you need right here. From quick-start guides to in-depth API references, this
            space is designed to help you ship faster and smarter.
          </styled.p>
        }
      />
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
      <Flex mt="space.07" flexDirection={{ lg: 'row', md: 'column', sm: 'column' }} flexWrap="wrap">
        <Box mb="space.05" flex="2" maxWidth="900px">
          <GuideList
            items={categories.map(category => ({
              id: category._id,
              title: category.name,
              href: `/support/${category.slug.current}`,
              icon: category.icon?.asset as unknown as SanityImageAsset | undefined,
              guideCount: category.guideCount,
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
