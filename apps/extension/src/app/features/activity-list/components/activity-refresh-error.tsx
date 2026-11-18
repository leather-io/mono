import { Flex } from 'leather-styles/jsx';

import { Button, Caption } from '@leather.io/ui';

interface ActivityRefreshErrorProps {
  onRetry(): void;
}

export function ActivityRefreshError({ onRetry }: ActivityRefreshErrorProps) {
  return (
    <Flex gap="space.03" justifyContent="center" alignItems="center" py="space.02">
      <Caption>Unable to update activity</Caption>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </Flex>
  );
}
