import type { ReactNode } from 'react';

import { Box, Stack } from 'leather-styles/jsx';

import { Content } from '@app/components/layout';

type DetailsScreenSurface = 'separated' | 'flat';

interface DetailsScreenProps {
  header: ReactNode;
  overview: ReactNode;
  children: ReactNode;
  surface?: DetailsScreenSurface;
  testId?: string;
}

export function DetailsScreen({
  header,
  overview,
  children,
  surface = 'separated',
  testId,
}: DetailsScreenProps) {
  const isFlat = surface === 'flat';
  return (
    <Content>
      <Stack width="100%" gap="space.00" data-testid={testId}>
        {header}
        <Box width="100%" maxWidth={['100%', null, '780px']} margin="0 auto">
          <Stack
            bg={isFlat ? 'ink.background-primary' : 'ink.background-secondary'}
            borderRadius={['0', null, 'md']}
            overflow="hidden"
            gap={isFlat ? 'space.00' : 'space.01'}
          >
            {overview}
            <Stack gap={isFlat ? 'space.00' : 'space.01'}>{children}</Stack>
          </Stack>
        </Box>
      </Stack>
    </Content>
  );
}
