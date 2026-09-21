import type { ReactNode } from 'react';

import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { Stack, styled } from 'leather-styles/jsx';

interface ActivityStatusHeadlineProps {
  headline: string;
  requester?: ReactNode;
}

export function ActivityStatusHeadline({ headline, requester }: ActivityStatusHeadlineProps) {
  return (
    <Stack
      gap="space.02"
      bg="ink.background-primary"
      px="space.05"
      pt="space.01"
      pb="space.03"
      width="100%"
    >
      <styled.h1 textStyle="heading.03" data-testid={ActivitySelectors.ActivityDetailsHeadline}>
        {headline}
      </styled.h1>
      {requester}
    </Stack>
  );
}
