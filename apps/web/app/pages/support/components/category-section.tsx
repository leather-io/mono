import { Box, Grid, styled } from 'leather-styles/jsx';
import { urlFor } from '~/constants/cms-client';

import type { SanityImageAsset } from '@leather.io/cms';

interface CategoryGuide {
  _id: string;
  title: string;
  slug: { current: string };
}

interface CategorySectionProps {
  categoryName: string;
  icon?: SanityImageAsset;
  guides: CategoryGuide[] | null;
}

export function CategorySection({ categoryName, icon, guides }: CategorySectionProps) {
  return (
    <Box>
      <Box display="flex" alignItems="center" gap="space.02" height="64px">
        <Box
          bg="ink.background-secondary"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="md"
          width="32px"
          height="32px"
          flexShrink={0}
          overflow="hidden"
          p="space.02"
        >
          <styled.img
            src={icon ? urlFor(icon).width(16).height(16).url() : '/icons/rocket.svg'}
            width="16px"
            height="16px"
          />
        </Box>
        <styled.h3 textStyle="label.01">{categoryName}</styled.h3>
      </Box>
      <Grid pl="40px" columns={2} gap="space.05">
        {guides?.map((guide, index) => {
          const isLastRow =
            guides.length % 2 === 0 ? index >= guides.length - 2 : index >= guides.length - 1;

          return (
            <styled.a
              key={guide._id}
              textStyle="label.03"
              href={`/support/${guide.slug.current}`}
              display="flex"
              alignItems="center"
              gap="space.03"
              height="48px"
              textDecoration="none"
              color="inherit"
              _hover={{ color: 'ink.text-subdued' }}
            >
              <Box
                width="4px"
                height="4px"
                borderRadius="round"
                bg="ink.text-primary"
                flexShrink={0}
              />
              <styled.span
                textStyle="label.03"
                flex={1}
                borderBottom={isLastRow ? 'none' : 'default'}
                height="100%"
                display="flex"
                alignItems="center"
              >
                {guide.title}
              </styled.span>
            </styled.a>
          );
        })}
      </Grid>
    </Box>
  );
}
