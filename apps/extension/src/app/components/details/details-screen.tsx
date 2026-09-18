import type { ReactNode } from 'react';

import { Box, Stack } from 'leather-styles/jsx';

import { Content } from '@app/components/layout';

interface DetailsScreenProps {
  header: ReactNode;
  overview: ReactNode;
  children: ReactNode;
  testId?: string;
}

export function DetailsScreen({ header, overview, children, testId }: DetailsScreenProps) {
  return (
    <Content>
      <Stack width="100%" gap="space.00" data-testid={testId}>
        {header}
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
