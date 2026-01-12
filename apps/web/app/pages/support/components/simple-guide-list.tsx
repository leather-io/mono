import { ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

import { ChevronRightIcon } from '@leather.io/ui';

interface SimpleGuideListItem {
  id: string;
  title: string;
  href: string;
}

interface GuideListProps {
  items: SimpleGuideListItem[];
}

export function SimpleGuideList({ items }: GuideListProps) {
  return (
    <styled.ul width="100%" listStyleType="none" p="space.03" border="default" borderRadius="md">
      {items.map(item => (
        <SimpleGuideListItem key={item.id} href={item.href} title={item.title} />
      ))}
    </styled.ul>
  );
}

interface SimpleGuideListItemProps {
  href: string;
  title: ReactNode;
}

function SimpleGuideListItem({ href, title }: SimpleGuideListItemProps) {
  return (
    <styled.li
      height="48px"
      my="space.02"
      cursor="pointer"
      _hover={{ bg: 'ink.component-background-hover', borderRadius: 'sm' }}
    >
      <styled.a
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        height="100%"
        px="space.03"
        textStyle="label.01"
        href={href}
        textDecoration="none"
        color="inherit"
      >
        {title}
        <ChevronRightIcon variant="small" />
      </styled.a>
    </styled.li>
  );
}
