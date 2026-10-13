import { Flex } from 'leather-styles/jsx';

import { Button, Caption } from '@leather.io/ui';

interface ActivityLoadMoreErrorProps {
  onRetry(): void;
}

export function ActivityLoadMoreError({ onRetry }: ActivityLoadMoreErrorProps) {
  return (
    <Flex gap="space.03" justifyContent="center" alignItems="center" py="space.04">
      <Caption>Unable to load more activity</Caption>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </Flex>
  );
}
