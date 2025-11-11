import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';
import { useViewportMinWidth } from '~/utils/hooks/use-media-query';

interface PortfolioPageLayoutProps {
  overview: React.ReactElement;
  assetList: React.ReactElement;
  activityList: React.ReactElement;
  visualization?: React.ReactElement;
  assetCount: number;
}
export function PortfolioPageLayout({
  overview,
  assetList,
  activityList,
  visualization,
  assetCount,
}: PortfolioPageLayoutProps) {
  const isLargeViewport = useViewportMinWidth('md');

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

        <Flex flexDirection={['column', null, null, 'row']} py="space.05" gap="space.05">
          <Stack height="70vh" minHeight={500} flex={2}>
            <styled.h2 textStyle="heading.05" mt="space.05" mb="space.02">
              Tokens <styled.span color="ink.text-subdued">{assetCount}</styled.span>
            </styled.h2>
            <Stack overflow="auto" flexGrow={1}>
              {assetList}
            </Stack>
          </Stack>
          <Stack height="70vh" minHeight={500} flex={1}>
            <styled.h2 textStyle="heading.05" mt="space.05" mb="space.02">
              Recent activity
            </styled.h2>
            <Stack
              minWidth={isLargeViewport ? 400 : 0}
              position="relative"
              flex={1}
              border="default"
              borderRadius="sm"
              height="100%"
              overflowX="scroll"
            >
              {activityList}
            </Stack>
          </Stack>
        </Flex>
      </styled.div>
    </Page>
  );
}
