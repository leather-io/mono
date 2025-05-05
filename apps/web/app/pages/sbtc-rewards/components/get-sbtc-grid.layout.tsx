import { GridProps } from 'leather-styles/jsx';

import { InfoGrid } from '../../../components/info-grid/info-grid';

interface GetSbtcGridLayoutProps extends GridProps {
  cells: [React.ReactNode, React.ReactNode];
}
export function GetSbtcGridLayout({ cells, ...gridProps }: GetSbtcGridLayoutProps) {
  return (
    <InfoGrid gridTemplateColumns={['1fr', '1fr', 'repeat(2, 1fr)']} {...gridProps}>
      <InfoGrid.Cell justifyContent="space-between">{cells[0]}</InfoGrid.Cell>
      <InfoGrid.Cell>{cells[1]}</InfoGrid.Cell>
    </InfoGrid>
  );
}
