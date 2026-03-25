import { ReactNode } from 'react';

import { GridProps, VStack } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';

interface StackingInfoGridLayoutProps extends GridProps {
  cells: {
    actionButtons?: ReactNode;
    name: ReactNode;
    status: ReactNode;
    historicalApr: ReactNode;
    minimumLockupPeriod: ReactNode;
    totalValueLocked: ReactNode;
    daysUntilNextCycle: ReactNode;
    rewardsToken: ReactNode;
    minimumCommitment: ReactNode;
    poolAddress: ReactNode;
    rewardAddress: ReactNode;
  };
}
export function StackingInfoGridLayout({ cells, ...props }: StackingInfoGridLayoutProps) {
  return (
    <VStack gap="0">
      {cells.actionButtons && (
        <InfoGrid
          width="100%"
          gap="0"
          borderBottomRadius="0"
          display={['none', 'none', 'grid']}
          gridTemplateColumns="248px 1fr"
          gridTemplateRows="auto"
        >
          <InfoGrid.Cell>{cells.name}</InfoGrid.Cell>
          <InfoGrid.Cell flexDir="row" justifyContent="flex-end" alignItems="center" p="space.05">
            {cells.actionButtons}
          </InfoGrid.Cell>
        </InfoGrid>
      )}

      <InfoGrid
        width="100%"
        borderTopRadius={['sm', 'sm', cells.actionButtons ? '0' : 'sm']}
        borderTop={['default', 'default', cells.actionButtons ? 'none' : 'default']}
        borderBottomRadius={['sm', 'sm', '0']}
        gridTemplateColumns={[
          'repeat(2, minmax(0, 1fr))',
          'repeat(3, minmax(0, 1fr))',
          '248px repeat(3, minmax(0, 1fr))',
        ]}
        {...props}
      >
        <InfoGrid.Cell gridColumn={[2, 2, 1]} gridRow={[1, 1, '1 / span 2']}>
          {cells.status}
        </InfoGrid.Cell>
        <InfoGrid.Cell
          display={['flex', 'flex', cells.actionButtons ? 'none' : 'flex']}
          gridColumn={[1, 1, 'none']}
          gridRow={[1, 1, 'none']}
        >
          {cells.name}
        </InfoGrid.Cell>

        <InfoGrid.Cell gridColumn={[1, 3, 2]} gridRow={[2, 1, 1]}>
          {cells.historicalApr}
        </InfoGrid.Cell>

        <InfoGrid.Cell gridColumn={[2, 1, 2]} gridRow={[2, 2, 2]}>
          {cells.minimumLockupPeriod}
        </InfoGrid.Cell>

        <InfoGrid.Cell gridColumn={[1, 2, 3]} gridRow={[3, 2, 1]}>
          {cells.totalValueLocked}
        </InfoGrid.Cell>

        <InfoGrid.Cell gridColumn={[2, 3, 3]} gridRow={[3, 2, 2]}>
          {cells.daysUntilNextCycle}
        </InfoGrid.Cell>

        <InfoGrid.Cell gridColumn={[1, 2, 4]} gridRow={[4, 3, 1]}>
          {cells.rewardsToken}
        </InfoGrid.Cell>

        <InfoGrid.Cell gridColumn={[2, 1, 4]} gridRow={[4, 3, 2]}>
          {cells.minimumCommitment}
        </InfoGrid.Cell>
      </InfoGrid>

      <InfoGrid
        borderTop="none"
        borderTopRadius="0"
        mt="0"
        width="100%"
        display={['none', 'none', 'grid']}
        gridTemplateColumns="repeat(2, minmax(0, 1fr))"
        gridTemplateRows="auto"
        height="fit-content"
      >
        <InfoGrid.Cell>{cells.poolAddress}</InfoGrid.Cell>
        <InfoGrid.Cell>{cells.rewardAddress}</InfoGrid.Cell>
      </InfoGrid>
    </VStack>
  );
}
