import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

interface PortfolioPageLayoutProps {
  overview: React.ReactElement;
  assetList: React.ReactElement;
  activityList: React.ReactElement;
  visualization?: React.ReactElement;
}
export function PortfolioPageLayout({
  overview,
  assetList,
  activityList,
  visualization,
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

        <Flex flexDirection="row" py="space.05" gap="space.05">
          <Stack height="70vh" minHeight={500} flexGrow={1}>
            <styled.h2 textStyle="heading.05" mt="space.05" mb="space.05" ml="space.05">
              Tokens
            </styled.h2>
            <Stack overflow="scroll" borderRadius="sm" border="default" flexGrow={1}>
              {assetList}
            </Stack>
          </Stack>
          <Stack height="70vh" minHeight={500} flexGrow={1}>
            <styled.h2 textStyle="heading.05" mt="space.05" mb="space.05" ml="space.05">
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
