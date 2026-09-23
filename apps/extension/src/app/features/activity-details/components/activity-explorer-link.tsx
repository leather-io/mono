import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { Box, Flex, Stack } from 'leather-styles/jsx';

import { Button, ExternalLinkIcon } from '@leather.io/ui';

const fadeHeight = '32px';

const fadeGradient = 'linear-gradient(to top, token(colors.ink.background-primary), transparent)';

interface ActivityExplorerLinkProps {
  onOpen(): void;
}

export function ActivityExplorerLink({ onOpen }: ActivityExplorerLinkProps) {
  return (
    <Stack gap="space.00" zIndex={1}>
      <Box height={fadeHeight} flexShrink={0} bgImage={fadeGradient} />
      <Flex
        bg="ink.background-primary"
        px="space.05"
        pt="space.01"
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
    </Stack>
  );
}
