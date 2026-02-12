import { useLocation, useNavigate } from 'react-router';

import { Flex } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

interface CollectibleDetailsActionsProps {
  onSend?(): void;
  canReceive?: boolean;
}

export function CollectibleDetailsActions({ onSend, canReceive = true }: CollectibleDetailsActionsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleReceive = () => {
    void navigate(`${RouteUrls.Home}${RouteUrls.Receive}`, {
      state: { backgroundLocation: location },
    });
  };

  return (
    <Flex gap="space.03" justifyContent="center">
      {onSend && (
        <Button
          variant="outline"
          onClick={onSend}
          minWidth="100px"
          data-testid="collectible-send-btn"
        >
          Send
        </Button>
      )}
      {canReceive && (
        <Button
          variant="outline"
          onClick={handleReceive}
          minWidth="100px"
          data-testid="collectible-receive-btn"
        >
          Receive
        </Button>
      )}
    </Flex>
  );
}
