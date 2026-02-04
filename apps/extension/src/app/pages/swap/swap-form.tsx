import { Box } from 'leather-styles/jsx/index';

import { RouteUrls } from '@shared/route-urls';

import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';

export function SwapForm() {
  return (
    <Box width="100%">
      <PageHeader title="Swap" onBackLocation={RouteUrls.Home} />
      <Content>
        <Page>
          <Card>{null}</Card>
        </Page>
      </Content>
    </Box>
  );
}
