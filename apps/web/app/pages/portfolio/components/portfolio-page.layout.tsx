import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

interface PortfolioPageLayoutProps {
  overview: React.ReactElement;
  visualization: React.ReactElement;
  assetCount: number;
  assetList: React.ReactElement;
  activityList: React.ReactElement;
}

export function PortfolioPageLayout({
  overview,
  visualization,
  assetCount,
  assetList,
  activityList,
}: PortfolioPageLayoutProps) {
  return (
    <Page overflow="hidden">
      <Page.Header title="Portfolio" />
      <styled.h2 textStyle="heading.05" mt="space.05" mb="space.04">
        Overview
      </styled.h2>
      <styled.div borderTop="none">
        <Box borderRadius="sm" border="default" p="space.05">
          {overview}
          <Box mt="space.04" height="32px">
            {visualization}
          </Box>
        </Box>

        <Flex flexDirection={['column', null, 'row']} py="space.05" gap="space.05">
          <Stack height={['auto', null, '70vh']} minHeight={[null, null, 500]} flexGrow={1}>
            <styled.h2 textStyle="heading.05" mt="space.05" mb="space.02">
              Tokens <styled.span color="ink.text-subdued">{assetCount}</styled.span>
            </styled.h2>
            <Stack overflow={['visible', null, 'auto']} flexGrow={1}>
              {assetList}
            </Stack>
          </Stack>
          <Stack height={['auto', null, '70vh']} minHeight={[null, null, 500]} flexGrow={1}>
            <styled.h2 textStyle="heading.05" mt="space.05" mb="space.02">
              Recent activity
            </styled.h2>
            <Stack flexGrow={1} border="default" borderRadius="sm" height="100%">
              {activityList}
            </Stack>
          </Stack>
        </Flex>
      </styled.div>
    </Page>
  );
}
