import { Box, BoxProps, Flex, Stack, styled } from 'leather-styles/jsx';
import { ConnectOverlayBackdrop } from '~/components/connect-card/connect-overlay';
import { ActivityButton } from '~/features/activity-button/activity-button';
import { Page } from '~/layouts/page/page';

interface PortfolioPageLayoutProps extends BoxProps {
  overview: React.ReactElement;
  assetList: React.ReactElement;
  activityList: React.ReactElement;
  visualization?: React.ReactElement;
  assetCount: number;
  dummyDataMode?: boolean;
}
export function PortfolioPageLayout({
  overview,
  assetList,
  activityList,
  visualization,
  assetCount,
  dummyDataMode,
  ...props
}: PortfolioPageLayoutProps) {
  return (
    <Page overflow="hidden" {...props}>
      <Page.Header title="Portfolio">
        <ActivityButton activityList={activityList} />
      </Page.Header>

      <ConnectOverlayBackdrop isActive={dummyDataMode}>
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
          </Flex>
        </styled.div>
      </ConnectOverlayBackdrop>
    </Page>
  );
}
