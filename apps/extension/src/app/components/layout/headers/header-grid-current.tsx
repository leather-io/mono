import { Flex, Grid, GridItem, HStack } from 'leather-styles/jsx';

import type { HasChildren } from '@app/common/has-children';

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
        <Flex py={{ base: 0, md: 'space.01' }} ml="space.02">
          {leftCol}
        </Flex>
      </GridItem>
      {centerCol && <GridItem margin="auto">{centerCol}</GridItem>}
      <GridItem>{rightCol}</GridItem>
    </Grid>
  );
}

export function HeaderGridRightCol({ children }: HasChildren) {
  return (
    <HStack alignItems="center" justifyContent="flex-end">
      {children}
    </HStack>
  );
}
