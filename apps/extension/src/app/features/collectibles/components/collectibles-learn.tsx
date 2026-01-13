import { Flex, Stack, styled } from 'leather-styles/jsx';

import { ChevronRightIcon } from '@leather.io/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';

interface LearnItem {
  title: string;
  url: string;
}

const learnItems: LearnItem[] = [
  { title: 'Getting Started with Leather', url: 'https://leather.io/help' },
  { title: 'What are Bitcoin Ordinals?', url: 'https://leather.io/help' },
  { title: 'What is BNS? (Bitcoin Naming System)', url: 'https://leather.io/help' },
];

export function CollectiblesLearn() {
  return (
    <Stack gap="space.00">
      <styled.div px={{ base: 0, md: 'space.05' }} py="space.03">
        <styled.h2 textStyle="label.01" margin="0">
          Learn
        </styled.h2>
      </styled.div>

      {learnItems.map(item => (
        <styled.button
          key={item.title}
          type="button"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="space.03"
          width="100%"
          px={{ base: 0, md: 'space.05' }}
          py="space.03"
          textAlign="left"
          bg="ink.background-primary"
          _hover={{ bg: 'ink.component-background-hover', cursor: 'pointer' }}
          onClick={() => openInNewTab(item.url)}
        >
          <Flex alignItems="center" gap="space.03" minWidth={0}>
            <Flex
              width="48px"
              height="48px"
              borderRadius="xs"
              bg="ink.background-secondary"
              border="default"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <ChevronRightIcon variant="small" />
            </Flex>
            <styled.span
              textStyle="label.01"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {item.title}
            </styled.span>
          </Flex>
        </styled.button>
      ))}
    </Stack>
  );
}
