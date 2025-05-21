import { Box, Flex, GridProps, styled } from 'leather-styles/jsx';
import { WhenClient } from '~/components/client-only';
import { BitcoinIcon } from '~/components/icons/bitcoin-icon';
import { StacksIcon } from '~/components/icons/stacks-icon';
import { GetSbtcGridLayout } from '~/pages/sbtc-rewards/components/get-sbtc-grid.layout';

import { Badge, Button } from '@leather.io/ui';

import { BridgingStatus, useSbtcRewardContext } from '../sbtc-rewards-context';
import { content } from '~/data/content';
import { getLearnMoreLink } from '~/features/page/page';

function MaxCapacity({ bridgingStatus }: { bridgingStatus: BridgingStatus }) {
  if (bridgingStatus !== 'disabled') return null;
  return (
    <Badge
      mt="space.03"
      mb="space.03"
      variant="info"
      label="Max bridging capacity reached"
    />
  );
}

function BridgeToSbtcCell() {
  const { onBridgeSbtc, bridgingStatus, whenExtensionState } = useSbtcRewardContext();
  const sbtcBridgePost = content.posts.sbtcBridge;
  return (
    <Flex flexDir={['column', 'row', 'column', 'row']} justifyContent="space-between" p="space.05">
      <Flex flexDir="column" flex={1} justifyContent="space-between">
        <BitcoinIcon size={32} />

        <Box mt="space.04">
          <styled.h4 textStyle="heading.05">Bridge BTC to sBTC</styled.h4>
          <MaxCapacity bridgingStatus={bridgingStatus} />
          {sbtcBridgePost && (
            <styled.p textStyle="caption.01" mt="space.01" mr="space.05" color="ink.text-subdued">
              {sbtcBridgePost.prompt}
              {getLearnMoreLink(sbtcBridgePost.slug, sbtcBridgePost.prompt)}
            </styled.p>
          )}
        </Box>
      </Flex>

      <Flex flexDir="column" justifyContent="space-between" alignItems="flex-end">
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
  const stacksSwapsPost = content.posts.stacksSwaps;
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
          {stacksSwapsPost && (
            <styled.p textStyle="caption.01" mt="space.01" mr="space.05" color="ink.text-subdued">
              {stacksSwapsPost.prompt}
              {getLearnMoreLink(stacksSwapsPost.slug, stacksSwapsPost.prompt)}
            </styled.p>
          )}
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

export function GetSbtcGrid(props: GridProps) {
  return (
    <GetSbtcGridLayout
      cells={[<BridgeToSbtcCell key={0} />, <SwapStxToSbtcCell key={1} />]}
      {...props}
    />
  );
}
