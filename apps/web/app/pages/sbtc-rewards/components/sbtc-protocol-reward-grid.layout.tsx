import { css } from 'leather-styles/css';
import { GridProps } from 'leather-styles/jsx';

import { InfoGrid } from '../../../components/info-grid/info-grid';

interface SbtcProtocolRewardGridLayoutProps extends GridProps {
  primaryCell: React.ReactNode;
  cells: [React.ReactNode, React.ReactNode, React.ReactNode, React.ReactNode];
}
export function SbtcProtocolRewardGridLayout({
  primaryCell,
  cells,
  ...props
}: SbtcProtocolRewardGridLayoutProps) {
  return (
    <InfoGrid
      width="100%"
      gridTemplateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
      gridTemplateRows={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(2, 1fr)']}
      height="fit-content"
      className={css({ '& > *:not(:first-child)': { height: ['120px', null, 'unset'] } })}
      {...props}
    >
      <InfoGrid.Cell gridRow={['span 4 / span 4', 'span 4 / span 4', 'span 2']}>
        {primaryCell}
      </InfoGrid.Cell>
      <InfoGrid.Cell>{cells[0]}</InfoGrid.Cell>
      <InfoGrid.Cell gridColumn="2" gridRow="2">
        {cells[1]}
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumnStart={[2, 2, 3]} gridRowStart={[3, 3, 1]}>
        {cells[2]}
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumnStart={[2, 2, 3]} gridRowStart={[4, 4, 2]}>
        {cells[3]}
      </InfoGrid.Cell>
    </InfoGrid>
  );
}
