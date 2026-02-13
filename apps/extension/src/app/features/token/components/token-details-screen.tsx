import type { ReactNode } from 'react';

import { Box, Stack } from 'leather-styles/jsx';

import { Content } from '@app/components/layout';

import { TokenDetailsHeader } from './token-details-header';

interface TokenDetailsScreenProps {
  title: string;
  overview: ReactNode;
  children: ReactNode;
}

export function TokenDetailsScreen({ title, overview, children }: TokenDetailsScreenProps) {
  return (
    <Content>
      <Stack width="100%" gap="space.00" data-testid="token-details-container">
        <TokenDetailsHeader title={title} />
        <Box width="100%" maxWidth={['100%', null, '780px']} margin="0 auto">
          <Stack
            bg="ink.background-secondary"
            borderRadius={['0', null, 'md']}
            overflow="hidden"
            gap="space.01"
          >
            {overview}
            <Stack gap="space.01">{children}</Stack>
          </Stack>
        </Box>
      </Stack>
    </Content>
  );
}
