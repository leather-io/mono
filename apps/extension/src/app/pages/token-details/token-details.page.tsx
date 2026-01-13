import { Box } from 'leather-styles/jsx';

import { Content } from '@app/components/layout';
import { TokenDetails } from '@app/features/token/token-details';

export function TokenDetailsPage() {
  return (
    <Content>
      <Box width="100%">
        <TokenDetails />
      </Box>
    </Content>
  );
}
