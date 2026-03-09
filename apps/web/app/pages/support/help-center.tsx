import { useLoaderData } from 'react-router';

import { Box, Flex, VStack } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';
import { CategorySection } from '~/pages/support/components/category-section';
import { GuideSearch } from '~/pages/support/components/guide-search';
import { SupportFormProvider } from '~/pages/support/components/support-form-provider';
import { loader } from '~/pages/support/help-center.route';

import type { SanityImageAsset } from '@leather.io/cms';

export function HelpCenter() {
  const { categories } = useLoaderData<typeof loader>();

  if (!categories) return null;

  return (
    <Page>
      <Page.Header title="Help Center" />

      <Page.Heading title="How can we help?" />

      <Flex mt="space.07" flexDirection={{ lg: 'row', base: 'column' }} flexWrap="wrap">
        <Box mb="space.05" flex="2" maxWidth="900px">
          <Box mb="space.07">
            <GuideSearch />
          </Box>
          <VStack gap="space.07" alignItems="stretch">
            {categories.map(category => (
              <CategorySection
                key={category._id}
                categoryName={category.categoryName}
                icon={category.icon?.asset as unknown as SanityImageAsset | undefined}
                guides={category.guides}
              />
            ))}
          </VStack>
        </Box>
        <Box
          maxWidth="400px"
          mb="space.07"
          ml={{ lg: 'space.10', base: 'none' }}
          flex="1"
          flexDirection="column"
        >
          <SupportFormProvider />
        </Box>
      </Flex>
    </Page>
  );
}
