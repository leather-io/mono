import { Box } from 'leather-styles/jsx';

import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';

export function SwapReview() {
  return (
    <Box width="100%">
      <PageHeader title="Swap" />
      <Content>
        <Page>
          <Card>{null}</Card>
        </Page>
      </Content>
    </Box>
  );
}
