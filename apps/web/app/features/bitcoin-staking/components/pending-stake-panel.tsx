import { css } from 'leather-styles/css';
import { HStack, Stack, styled } from 'leather-styles/jsx';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';

import { ArrowRotateClockwiseIcon, Avatar } from '@leather.io/ui';

const spin = css({ animation: 'spin', animationDuration: '1.4s' });

export function PendingStakePanel() {
  return (
    <HStack
      gap="space.04"
      alignItems="center"
      p="space.05"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="md"
      data-testid="pending-stake-panel"
    >
      <Avatar
        size="lg"
        variant="square"
        icon={<ArrowRotateClockwiseIcon color="ink.text-subdued" className={spin} />}
      />
      <Stack gap="space.01">
        <styled.p textStyle="label.02">{bitcoinStakingContent.pendingStake.title}</styled.p>
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          {bitcoinStakingContent.pendingStake.description}
        </styled.p>
      </Stack>
    </HStack>
  );
}
