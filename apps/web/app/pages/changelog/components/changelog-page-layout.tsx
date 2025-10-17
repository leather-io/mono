import { Box, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';
import { openExternalLink } from '~/utils/external-links';

import { Button, FeedIcon, HasChildren } from '@leather.io/ui';

interface ChangelogPageLayoutProps {
  children: React.ReactNode;
  backButton?: React.ReactNode;
}
export function ChangelogPageLayout(props: ChangelogPageLayoutProps) {
  return (
    <Page>
      <Page.Header title={props.backButton || 'Changelog'}>
        <Box mr="space.04" hideBelow="md">
          <Button
            variant="ghost"
            size="sm"
            iconStart={FeedIcon}
            onClick={() => openExternalLink(`${window.location.origin}/changelog.xml`)}
          >
            Subscribe
          </Button>
        </Box>
      </Page.Header>
      <Box maxW="960px" mt="space.08">
        {props.children}
      </Box>
    </Page>
  );
}

interface ChangelogEntryLayoutProps extends HasChildren {
  leftColumn: React.ReactNode;
  isLast?: boolean;
}
export function ChangelogEntryLayout(props: ChangelogEntryLayoutProps) {
  return (
    <Flex flexDir={['column', null, null, 'row']} mb="space.07" pb="space.07" position="relative">
      {!props.isLast && (
        <styled.div
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="1px"
          bgGradient="to-r"
          gradientFrom="ink.border-default"
          gradientTo="transparent"
        />
      )}
      <Box>
        <Box
          width={['auto', null, null, '280px']}
          position={[null, null, null, 'sticky']}
          top={[null, null, null, '10px']}
        >
          {props.leftColumn}
        </Box>
      </Box>
      <Flex flexDir="column" ml={['none', null, null, 'space.07']}>
        {props.children}
      </Flex>
    </Flex>
  );
}
