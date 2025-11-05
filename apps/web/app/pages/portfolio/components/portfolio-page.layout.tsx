import { Box, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

interface PortfolioPageLayoutProps {
  overview: React.ReactElement;
  assetList: React.ReactElement;
  visualization: React.ReactElement;
}
export function PortfolioPageLayout({
  overview,
  assetList,
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
        <Box borderTop="default" py="space.05" pb="space.03">
          {assetList}
        </Box>
      </styled.div>
    </Page>
  );
}
