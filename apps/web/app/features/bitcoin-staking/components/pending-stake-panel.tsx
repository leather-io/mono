import { HStack, Stack, styled } from 'leather-styles/jsx';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';

import { Flag, InfoCircleIcon } from '@leather.io/ui';

export function PendingStakePanel() {
  return (
    <Stack
      gap="space.02"
      p="space.05"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="md"
      data-testid="pending-stake-panel"
    >
      <HStack gap="space.03">
        <Flag img={<InfoCircleIcon />} align="top">
          <Stack gap="space.01">
            <styled.p textStyle="label.02">{bitcoinStakingContent.pendingStake.title}</styled.p>
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              {bitcoinStakingContent.pendingStake.description}
            </styled.p>
          </Stack>
        </Flag>
      </HStack>
    </Stack>
  );
}
