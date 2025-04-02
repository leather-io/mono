import { Box, Flex, GridProps, styled } from 'leather-styles/jsx';
import { DummyIcon } from '~/components/dummy';
import { BitcoinIcon } from '~/components/icons/bitcoin-icon';
import { StacksIcon } from '~/components/icons/stacks-icon';
import { PrimaryCellThreeGridLayout } from '~/components/layouts/primary-cell-three-grid.layout';

import { Button } from '@leather.io/ui';

export function SbtcStep1AcquireGrid(props: GridProps) {
  return (
    <PrimaryCellThreeGridLayout
      primaryCell={
        <Flex flex={1} flexDir="column" justifyContent="space-between" p="space.05">
          <DummyIcon />
          <Box>
            <styled.h3 textStyle="heading.05" mt="space.05">
              Choose to bridge or swap
            </styled.h3>
            <styled.p textStyle="caption.01" mt="space.01">
              sBTC can be acquired either by bridging BTC to the Stacks blockchain or swapping
              another asset on Stacks on the L2 itself.
            </styled.p>
          </Box>
        </Flex>
      }
      cells={[
        <Flex
          key={0}
          flexDir={['column', 'row', 'column', 'row']}
          justifyContent="space-between"
          p="space.05"
        >
          <Box>
            <BitcoinIcon size={32} />

            <styled.h4 textStyle="heading.05" mt="space.05">
              Bridge BTC to sBTC
            </styled.h4>
            <styled.p textStyle="caption.01" mt="space.01" mr="space.05">
              Bitcoin to Stacks via a trust-minimizing protocol
            </styled.p>
          </Box>
          <Flex alignItems="flex-end">
            <Button mt="space.04" size="xs">
              Bridge
            </Button>
          </Flex>
        </Flex>,
        <Flex
          key={1}
          flexDir={['column', 'row', 'column', 'row']}
          justifyContent="space-between"
          p="space.05"
        >
          <Box>
            <StacksIcon size={32} />

            <styled.h4 textStyle="heading.05" mt="space.05">
              Swap Stacks tokens for sBTC
            </styled.h4>

            <styled.p textStyle="caption.01" mt="space.01" mr="space.05">
              On Stacks via decentralized liquidity pools
            </styled.p>
          </Box>
          <Flex alignItems="flex-end">
            <Button mt="space.04" size="xs">
              Swap
            </Button>
          </Flex>
        </Flex>,
      ]}
      {...props}
    />
  );
}
