import { GridProps } from 'leather-styles/jsx';

import { InfoGrid } from '../../../components/info-grid/info-grid';

interface AcquireSbtcGridLayoutProps extends GridProps {
  primaryCell: React.ReactNode;
  cells: [React.ReactNode, React.ReactNode];
}
export function AcquireSbtcGridLayout({
  primaryCell,
  cells,
  ...gridProps
}: AcquireSbtcGridLayoutProps) {
  return (
    <InfoGrid
      gridTemplateColumns={['1fr', '1fr', 'repeat(2, 1fr)']}
      gridTemplateRows={['repeat(3, auto)', 'repeat(3, auto)', 'repeat(2, 1fr)']}
      mb="space.06"
      {...gridProps}
    >
      <InfoGrid.Cell gridRow={['1', '1', 'span 2 / span 2']} justifyContent="space-between">
        {primaryCell}
      </InfoGrid.Cell>

      <InfoGrid.Cell justifyContent="space-between">{cells[0]}</InfoGrid.Cell>

      <InfoGrid.Cell>{cells[1]}</InfoGrid.Cell>
    </InfoGrid>
  );
}
