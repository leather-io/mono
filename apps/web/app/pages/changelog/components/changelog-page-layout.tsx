import { Box, Flex } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { HasChildren, Link } from '@leather.io/ui';

interface ChangelogPageLayoutProps {
  children: React.ReactNode;
}
export function ChangelogPageLayout(props: ChangelogPageLayoutProps) {
  return (
    <Page>
      <Page.Header title="Changelog">
        <Box mr="space.06">
          <Link display="inline-block" href="/changelog.xml">
            Subscribe to RSS feed
          </Link>
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
}
export function ChangelogEntryLayout(props: ChangelogEntryLayoutProps) {
  return (
    <Flex flexDir={['column', null, null, 'row']} mb="space.07">
      <Box>
        <Box
          width={['auto', null, null, '200px']}
          position={[null, null, null, 'sticky']}
          mt={[null, null, null, '6px']}
          top={[null, null, null, '10px']}
        >
          {props.leftColumn}
        </Box>
      </Box>
      <Flex flexDir="column" ml={['none', null, null, 'space.05']}>
        {props.children}
      </Flex>
    </Flex>
  );
}
