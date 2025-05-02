import { Box, Flex, GridProps, styled } from 'leather-styles/jsx';
import { WhenClient } from '~/components/client-only';
import { BitcoinIcon } from '~/components/icons/bitcoin-icon';
import { StacksIcon } from '~/components/icons/stacks-icon';
import { AcquireSbtcGridLayout } from '~/pages/sbtc-rewards/components/acquire-sbtc-grid.layout';

import { Badge, Button } from '@leather.io/ui';

import { BridgingStatus, useSbtcRewardContext } from '../sbtc-rewards-context';

function MaxCapacity({ bridgingStatus }: { bridgingStatus: BridgingStatus }) {
  if (bridgingStatus !== 'disabled') return null;
  return (
    <Badge
      // Not sure why importants are needed here
      mt={['space.03', 'unset', 'space.02', 'unset']}
      variant="info"
      label="Max bridging capacity reached"
    />
  );
}

function BridgeToSbtcCell() {
  const { onBridgeSbtc, bridgingStatus, whenExtensionState } = useSbtcRewardContext();
  return (
    <Flex flexDir={['column', 'row', 'column', 'row']} justifyContent="space-between" p="space.05">
      <Flex flexDir="column" flex={1} justifyContent="space-between">
        <BitcoinIcon size={32} />

        <Box mt="space.04">
          <styled.h4 textStyle="heading.05">Bridge BTC to sBTC</styled.h4>
          <styled.p textStyle="caption.01" mt="space.01" mr="space.05" color="ink.text-subdued">
            Bitcoin to Stacks via a trust-minimizing protocol
          </styled.p>
        </Box>
      </Flex>

      <Flex flexDir="column" justifyContent="space-between" alignItems="flex-end">
        <MaxCapacity bridgingStatus={bridgingStatus} />

        <WhenClient>
          <Button
            onClick={onBridgeSbtc}
            disabled={bridgingStatus !== 'enabled'}
            mt="space.04"
            size="xs"
          >
            {whenExtensionState({
              connected: 'Bridge',
              detected: 'Sign in to bridge',
              missing: 'Install Leather to bridge',
            })}
          </Button>
        </WhenClient>
      </Flex>
    </Flex>
  );
}

function SwapStxToSbtcCell() {
  const { onSwapStxSbtc, whenExtensionState } = useSbtcRewardContext();
  return (
    <Flex
      flexDir={['column', 'row', 'column', 'row']}
      flex={1}
      justifyContent="space-between"
      p="space.05"
    >
      <Flex flexDir="column" flex={1} justifyContent="space-between">
        <StacksIcon size={32} />

        <Box mt="space.04">
          <styled.h4 textStyle="heading.05">Swap Stacks tokens for sBTC</styled.h4>

          <styled.p textStyle="caption.01" mt="space.01" mr="space.05" color="ink.text-subdued">
            On Stacks via decentralized liquidity pools
          </styled.p>
        </Box>
      </Flex>
      <Flex alignItems="flex-end">
        <WhenClient fallback={<Button width="52px" size="xs" aria-busy />}>
          <Button
            disabled={whenExtensionState({
              connected: false,
              detected: true,
              missing: true,
            })}
            onClick={onSwapStxSbtc}
            mt="space.04"
            size="xs"
          >
            {whenExtensionState({
              connected: 'Swap',
              detected: 'Sign in to swap',
              missing: 'Install Leather to swap',
            })}
          </Button>
        </WhenClient>
      </Flex>
    </Flex>
  );
}

export function AcquireSbtcGrid(props: GridProps) {
  return (
    <AcquireSbtcGridLayout
      cells={[<BridgeToSbtcCell key={0} />, <SwapStxToSbtcCell key={1} />]}
      {...props}
    />
  );
}
