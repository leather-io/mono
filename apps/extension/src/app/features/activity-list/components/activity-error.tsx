import { Stack } from 'leather-styles/jsx';

import { Button, Caption } from '@leather.io/ui';

interface ActivityErrorProps {
  onRetry(): void;
}

export function ActivityError({ onRetry }: ActivityErrorProps) {
  return (
    <Stack gap="space.04" justifyContent="center" alignItems="center" p="space.06">
      <Caption maxWidth="30ch" textAlign="center">
        Unable to load your activity
      </Caption>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </Stack>
  );
}
