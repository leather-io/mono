import type { ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';

export interface LearnItem {
  title: string;
  url: string;
  icon: ReactNode;
}

interface LearnLayoutProps {
  items: LearnItem[];
  'data-testid'?: string;
}

export function LearnLayout({ items, 'data-testid': dataTestId }: LearnLayoutProps) {
  return (
    <Stack gap="space.00" data-testid={dataTestId}>
      <styled.div px="space.03" py="space.03">
        <styled.h2 textStyle="label.01" margin="0">
          Learn
        </styled.h2>
      </styled.div>

      {items.map(item => (
        <styled.button
          key={item.title}
          type="button"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="space.03"
          width="100%"
          px="space.03"
          py="space.03"
          textAlign="left"
          bg="ink.background-primary"
          _hover={{ bg: 'ink.component-background-hover', cursor: 'pointer' }}
          onClick={() => openInNewTab(item.url)}
        >
          <Flex alignItems="center" gap="space.03" minWidth={0}>
            <Flex
              width="40px"
              height="40px"
              borderRadius="xs"
              bg="ink.background-secondary"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              {item.icon}
            </Flex>
            <styled.span textStyle="label.01">{item.title}</styled.span>
          </Flex>
        </styled.button>
      ))}
    </Stack>
  );
}
