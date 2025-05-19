import { StackerInfo } from '@stacks/stacking';
import BigNumber from 'bignumber.js';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { Address } from '~/features/stacking/components/address';
import { LiquidStackingActionButtons } from '~/features/stacking/direct-stacking-info/components/liquid-stacking-action-buttons';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { useStacksNetwork } from '~/store/stacks-network';
import { formatPoxAddressToNetwork } from '~/utils/stacking-pox';
import { toHumanReadableStx } from '~/utils/unit-convert';

import { Hr } from '@leather.io/ui';

import { PendingStackExtendAlert } from '../../components/pending-stack-extend-alert';
import { StackExtendInfo } from '../get-has-pending-stack-extend';
import { StackIncreaseInfo } from '../get-has-pending-stack-increase';
import { content } from '~/data/content';

type ActiveStackerInfo = StackerInfo & {
  stacked: true;
};

interface Props {
  lockedAmount: BigNumber;
  stackerInfoDetails: ActiveStackerInfo['details'];
  rewardCycleId: number;
  pendingStackIncrease: StackIncreaseInfo | undefined | null;
  pendingStackExtend: StackExtendInfo | undefined | null;
  protocolSlug: ProtocolSlug;
}

export function ActiveStackingInfo({
  lockedAmount,
  stackerInfoDetails: details,
  rewardCycleId,
  pendingStackExtend,
  pendingStackIncrease,
  protocolSlug,
}: Props) {
  const { network } = useStacksNetwork();
  const elapsedCyclesSinceStackingStart = Math.max(rewardCycleId - details.first_reward_cycle, 0);
  const elapsedStackingCycles = Math.min(elapsedCyclesSinceStackingStart, details.lock_period);
  const isBeforeFirstRewardCycle = rewardCycleId < details.first_reward_cycle;
  const poxAddress = formatPoxAddressToNetwork(network, details.pox_address);

  return (
    <Flex height="100%" flexDirection="column" justify="center" align="center">
      <Box my="space.10">
        <Box mx="space.04">
          <Flex flexDirection="column" pt="space.06" pb="space.05">
            <styled.h2 textStyle="heading.02">{content.statusMessages.youAreStacking}</styled.h2>
            <styled.p textStyle="heading.02" fontSize="24px" fontWeight={500}>
              {toHumanReadableStx(lockedAmount)}
            </styled.p>

            {isBeforeFirstRewardCycle && (
              <Box pb="space.04">
                <styled.p textStyle="label.02">{content.statusMessages.waitingForCycleToStart}</styled.p>
                <styled.p>{content.statusMessages.stackingReady}</styled.p>
              </Box>
            )}

            {pendingStackIncrease && (
              <Box pb="space.04">
                <styled.p textStyle="label.02">{content.statusMessages.waitingForTxConfirmation}</styled.p>
                <styled.p>
                  {content.statusMessages.stackingSubmitted.replace('an additional amount', `an additional amount of ${toHumanReadableStx(pendingStackIncrease.increaseBy)}`)}
                </styled.p>
              </Box>
            )}

            {pendingStackExtend && (
              <PendingStackExtendAlert pendingStackExtend={pendingStackExtend} />
            )}

            <Hr />

            <Box pt="space.04">
              <Box>
                <Box>
                  <styled.p textStyle="label.02">{content.sectionHeaders.duration}</styled.p>
                  <styled.p>
                    {elapsedStackingCycles} / {details.lock_period}
                  </styled.p>
                </Box>
                <Box>
                  <styled.p textStyle="label.02">{content.sectionHeaders.start}</styled.p>
                  <styled.p>Cycle {details.first_reward_cycle}</styled.p>
                </Box>
                <Box>
                  <styled.p textStyle="label.02">{content.sectionHeaders.end}</styled.p>
                  <styled.p>Cycle {details.first_reward_cycle + details.lock_period - 1}</styled.p>
                </Box>
                <Box>
                  <styled.p textStyle="label.02">{content.sectionHeaders.bitcoinAddress}</styled.p>
                  <Address address={poxAddress} />
                </Box>
                <LiquidStackingActionButtons protocolSlug={protocolSlug} />
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}
