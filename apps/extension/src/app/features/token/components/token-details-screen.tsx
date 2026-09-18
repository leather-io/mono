import type { ReactNode } from 'react';

import { Box, Stack } from 'leather-styles/jsx';

import { Content } from '@app/components/layout';

import { TokenDetailsHeader } from './token-details-header';

interface TokenDetailsScreenProps {
  title: string;
  children: ReactNode;
}

export function TokenDetailsScreen({ title, children }: TokenDetailsScreenProps) {
  return (
    <Content>
      <Stack width="100%" gap="space.00" data-testid="token-details-container">
        <TokenDetailsHeader title={title} />
        <Box width="100%" maxWidth={['100%', null, '780px']} margin="0 auto">
          <Stack
            bg="ink.background-primary"
            borderRadius={['0', null, 'md']}
            overflow="hidden"
            gap="space.00"
          >
            {children}
          </Stack>
        </Box>
      </Stack>
    </Content>
  );
}
