import { Flex } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

interface CollectibleDetailsActionsProps {
  onSend?(): void;
}

export function CollectibleDetailsActions({ onSend }: CollectibleDetailsActionsProps) {
  if (!onSend) return null;

  return (
    <Flex gap="space.03" justifyContent="center">
      <Button
        variant="outline"
        onClick={onSend}
        minWidth="100px"
        data-testid="collectible-send-btn"
      >
        Send
      </Button>
    </Flex>
  );
}
