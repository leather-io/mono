import { Box, Grid, styled } from 'leather-styles/jsx';
import { urlFor } from '~/constants/cms-client';

import type { SanityImageAsset } from '@leather.io/cms';
import { ChevronRightIcon } from '@leather.io/ui';

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
      <Box display="flex" alignItems="center" gap="space.03" height="64px">
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
      <Grid pl="40px" columns={2} rowGap="space.01" columnGap="space.08">
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
              className="group"
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
                borderBottom={isLastRow ? 'none' : '1px solid'}
                borderColor={isLastRow ? undefined : 'ink.component-background-non-interactive'}
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                {guide.title}
                <styled.span opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.15s">
                  <ChevronRightIcon variant="small" />
                </styled.span>
              </styled.span>
            </styled.a>
          );
        })}
      </Grid>
    </Box>
  );
}
