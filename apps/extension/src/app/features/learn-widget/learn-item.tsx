import { Box, styled } from 'leather-styles/jsx';

import { Avatar, ItemLayout } from '@leather.io/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';

interface LearnItemProps {
  icon: React.ReactNode;
  title: string;
  url: string;
}

export function LearnItem({ icon, title, url }: LearnItemProps) {
  return (
    <styled.button
      _hover={{ backgroundColor: 'ink.component-background-hover' }}
      mx="-space.05"
      px="space.05"
      py="space.03"
      borderRadius="xs"
      onClick={() => openInNewTab(url)}
    >
      <ItemLayout
        showChevron
        titleRight={null}
        img={
          <Avatar size="lg" bg="ink.component-background-hover">
            <Box color="ink.text-subdued">{icon}</Box>
          </Avatar>
        }
        titleLeft={title}
        captionLeft={null}
      />
    </styled.button>
  );
}
