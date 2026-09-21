import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { Flex } from 'leather-styles/jsx';

import { Button, ExternalLinkIcon } from '@leather.io/ui';

interface ActivityExplorerLinkProps {
  onOpen(): void;
}

export function ActivityExplorerLink({ onOpen }: ActivityExplorerLinkProps) {
  return (
    <Flex
      position="sticky"
      bottom={0}
      zIndex={1}
      bg="ink.background-primary"
      boxShadow="contentOverflowFade"
      px="space.05"
      pt="space.03"
      pb="space.05"
      justifyContent="center"
    >
      <Button
        width="100%"
        maxWidth="390px"
        variant="outline"
        iconEnd={ExternalLinkIcon}
        onClick={onOpen}
        data-testid={ActivitySelectors.ActivityDetailsExplorer}
      >
        View in explorer
      </Button>
    </Flex>
  );
}
