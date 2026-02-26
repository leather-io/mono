import { Link } from 'react-router';

import { styled } from 'leather-styles/jsx/factory';
import { VStack } from 'leather-styles/jsx/vstack';

import { HelpCenterGuideBySlugQueryResult } from '@leather.io/cms';
import { ChevronRightIcon } from '@leather.io/ui';

type RelatedGuide = NonNullable<
  NonNullable<HelpCenterGuideBySlugQueryResult>['relatedGuides']
>[number];

interface RelatedGuidesProps {
  guides: RelatedGuide[];
}

export function RelatedGuides({ guides }: RelatedGuidesProps) {
  if (guides.length === 0) return null;

  return (
    <VStack alignItems="flex-start" gap="space.05" my="space.09" width="100%">
      <styled.h3 textStyle="heading.05">Related articles</styled.h3>
      <styled.ul width="100%" listStyleType="none" p="space.03" border="default" borderRadius="md">
        {guides.map(guide => (
          <styled.li
            key={guide._id}
            cursor="pointer"
            _hover={{ bg: 'ink.component-background-hover', borderRadius: 'sm' }}
          >
            <Link
              to={`/support/${guide.slug.current}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <styled.span
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p="space.03"
                textStyle="label.02"
                color="ink.action-primary-default"
              >
                {guide.title}
                <ChevronRightIcon variant="small" />
              </styled.span>
            </Link>
          </styled.li>
        ))}
      </styled.ul>
    </VStack>
  );
}
