import { HStack, Stack, styled } from 'leather-styles/jsx';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';

import { ArrowRotateClockwiseIcon, Avatar, Flag } from '@leather.io/ui';

interface PreparePhaseCalloutProps {
  secondsUntilStakingReopens: number;
}

export function PreparePhaseCallout({ secondsUntilStakingReopens }: PreparePhaseCalloutProps) {
  const hoursUntilReopen = Math.max(1, Math.ceil(secondsUntilStakingReopens / 3600));

  return (
    <HStack
      p="space.04"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="md"
      data-testid="prepare-phase-callout"
    >
      <Flag
        img={<Avatar size="lg" variant="square" icon={<ArrowRotateClockwiseIcon />} />}
        align="top"
      >
        <Stack gap="space.01">
          <styled.p textStyle="label.03">{bitcoinStakingContent.preparePhase.title}</styled.p>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {bitcoinStakingContent.preparePhase.description} {hoursUntilReopen}h.
          </styled.p>
        </Stack>
      </Flag>
    </HStack>
  );
}
