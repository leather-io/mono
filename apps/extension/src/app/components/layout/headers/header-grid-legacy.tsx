import { ChainId } from '@stacks/network';
import { Flex, Grid, GridItem, HStack } from 'leather-styles/jsx';

import { NetworkModeBadge } from '@leather.io/ui';

import type { HasChildren } from '@app/common/has-children';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

import type { HeaderGridProps } from './header-grid';

export function HeaderGrid({ leftCol, centerCol, rightCol, ...props }: HeaderGridProps) {
  return (
    <Grid
      alignItems="center"
      gridTemplateColumns={centerCol ? '2fr 4fr 2fr' : 'auto auto'}
      gridAutoFlow="column"
      width="100%"
      {...props}
    >
      <GridItem justifySelf="start">
        <Flex py={[0, null, 'space.01']}>{leftCol}</Flex>
      </GridItem>
      {centerCol && <GridItem margin="auto">{centerCol}</GridItem>}
      <GridItem>{rightCol}</GridItem>
    </Grid>
  );
}

export function HeaderGridRightCol({ children }: HasChildren) {
  const { chain, name: chainName } = useCurrentNetworkState();
  return (
    <HStack alignItems="center" justifyContent="flex-end">
      <NetworkModeBadge isVisible={chain.stacks.chainId === ChainId.Testnet} name={chainName} />
      {children}
    </HStack>
  );
}
