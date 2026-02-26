import { Box, styled } from 'leather-styles/jsx';
import { urlFor } from '~/constants/cms-client';

import { SanityImageAsset } from '@leather.io/cms';

interface GuideListItem {
  id: string;
  title: string;
  href: string;
  icon?: SanityImageAsset;
  guideCount: number;
}

interface GuideListProps {
  items: GuideListItem[];
}

export function GuideList({ items }: GuideListProps) {
  return (
    <styled.ul width="100%" listStyleType="none">
      {items.map(item => (
        <GuideListItem key={item.id} {...item} />
      ))}
    </styled.ul>
  );
}

function GuideListItem({ href, title, icon, guideCount }: GuideListItem) {
  return (
    <styled.li
      height="auto"
      my="space.02"
      cursor="pointer"
      className="group"
      _hover={{ bg: 'ink.component-background-hover', borderRadius: 'sm' }}
      border="default"
      borderRadius="md"
    >
      <styled.a
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p="space.02"
        textStyle="label.01"
        href={href}
        textDecoration="none"
        color="inherit"
      >
        <Box display="flex" alignItems="center">
          <Box
            width="64px"
            height="64px"
            bg="ink.background-secondary"
            _groupHover={{ border: 'default' }}
            className="group"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mr="space.04"
            flexShrink={0}
          >
            <styled.img
              src={icon ? urlFor(icon).width(24).height(24).url() : '/icons/rocket.svg'}
              width="24"
              height="24"
            />
          </Box>
          <Box display="flex" flexDirection="column">
            <styled.span>{title}</styled.span>
            <styled.span textStyle="caption.01">
              {guideCount} {guideCount > 1 ? 'articles' : 'article'}
            </styled.span>
          </Box>
        </Box>
      </styled.a>
    </styled.li>
  );
}
