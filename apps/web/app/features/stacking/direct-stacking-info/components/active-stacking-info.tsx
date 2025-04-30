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
            <styled.h2 textStyle="heading.02">You&apos;re stacking</styled.h2>
            <styled.p textStyle="heading.02" fontSize="24px" fontWeight={500}>
              {toHumanReadableStx(lockedAmount)}
            </styled.p>

            {isBeforeFirstRewardCycle && (
              <Box pb="space.04">
                <styled.p textStyle="label.02">Waiting for the cycle to start</styled.p>
                <styled.p>
                  Your STX are ready for stacking. Once the next cycle starts the network will
                  determine if and how many slots are claimed.
                </styled.p>
              </Box>
            )}

            {pendingStackIncrease && (
              <Box pb="space.04">
                <styled.p textStyle="label.02">Waiting for transaction confirmation</styled.p>
                <styled.p>
                  A stacking request was successfully submitted to the blockchain. Once confirmed,
                  an additional amount of {toHumanReadableStx(pendingStackIncrease.increaseBy)} will
                  be stacking.
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
                  <styled.p textStyle="label.02">Duration</styled.p>
                  <styled.p>
                    {elapsedStackingCycles} / {details.lock_period}
                  </styled.p>
                </Box>
                <Box>
                  <styled.p textStyle="label.02">Start</styled.p>
                  <styled.p>Cycle {details.first_reward_cycle}</styled.p>
                </Box>
                <Box>
                  <styled.p textStyle="label.02">End</styled.p>
                  <styled.p>Cycle {details.first_reward_cycle + details.lock_period - 1}</styled.p>
                </Box>
                <Box>
                  <styled.p textStyle="label.02">Bitcoin address</styled.p>
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
