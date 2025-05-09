import { ReactNode } from 'react';

import { GridProps, VStack } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';

interface LiquidStackingInfoGridLayoutProps extends GridProps {
  cells: {
    status: ReactNode;
    name: ReactNode;
    stacking: ReactNode;
    estimatedRewards: ReactNode;
    currentCycle: ReactNode;
    nextCycle: ReactNode;
    poolAddress?: ReactNode;
    rewardAddress?: ReactNode;
  };
}

export function LiquidStackingInfoGridLayout({
  cells,
  ...props
}: LiquidStackingInfoGridLayoutProps) {
  return (
    <VStack gap="0">
      <InfoGrid
        width="100%"
        borderBottomRadius={['sm', 'sm', '0']}
        gridTemplateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', '248px repeat(2, 1fr)']}
        {...props}
      >
        <InfoGrid.Cell gridColumn={[2, 2, 1]} gridRow={[1, 1, '1 / span 2']}>
          {cells.status}
        </InfoGrid.Cell>
        <InfoGrid.Cell
          display={['flex', 'flex', 'none']}
          gridColumn={[1, 1, 'none']}
          gridRow={[1, 1, 'none']}
        >
          {cells.name}
        </InfoGrid.Cell>

        <InfoGrid.Cell gridColumnStart={[1, 3, 2]} gridRowStart={[2, 1, 1]}>
          {cells.stacking}
        </InfoGrid.Cell>

        <InfoGrid.Cell gridColumnStart={[2, 1, 3]} gridRowStart={[2, 2, 1]}>
          {cells.estimatedRewards}
        </InfoGrid.Cell>

        <InfoGrid.Cell gridColumnStart={[1, 2, 2]} gridRowStart={[3, 2, 2]}>
          {cells.currentCycle}
        </InfoGrid.Cell>

        <InfoGrid.Cell gridColumnStart={[2, 3, 3]} gridRowStart={[3, 2, 2]}>
          {cells.nextCycle}
        </InfoGrid.Cell>
      </InfoGrid>
      <InfoGrid
        borderTop="none"
        borderTopRadius="0"
        mt="0"
        width="100%"
        display={['none', 'none', 'grid']}
        gridTemplateColumns="repeat(2, 1fr)"
        gridTemplateRows="auto"
        height="fit-content"
      >
        {cells?.poolAddress && <InfoGrid.Cell>{cells.poolAddress}</InfoGrid.Cell>}
        {cells?.rewardAddress && <InfoGrid.Cell>{cells.rewardAddress}</InfoGrid.Cell>}
      </InfoGrid>
    </VStack>
  );
}
