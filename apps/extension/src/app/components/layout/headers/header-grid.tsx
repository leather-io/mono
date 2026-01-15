import { Flex, Grid, GridItem, type GridProps, HStack } from 'leather-styles/jsx';

import type { HasChildren } from '@app/common/has-children';

interface HeaderGridProps extends GridProps {
  leftCol: React.ReactNode;
  centerCol?: React.ReactNode;
  rightCol: React.ReactNode;
}

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
        <Flex py={[0, null, 'space.01']} ml="space.02">
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
