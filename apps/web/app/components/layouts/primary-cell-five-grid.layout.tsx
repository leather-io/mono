import { css } from 'leather-styles/css';
import { Flex, Grid, GridProps } from 'leather-styles/jsx';

interface PrimaryCellFiveGridLayoutProps extends GridProps {
  primaryCell: React.ReactNode;
  cells: [React.ReactNode, React.ReactNode, React.ReactNode, React.ReactNode];
}

export function PrimaryCellFiveGridLayout({
  primaryCell,
  cells,
  ...props
}: PrimaryCellFiveGridLayoutProps) {
  return (
    <Grid
      width="100%"
      border="default"
      gridTemplateColumns={['repeat(3, 1fr)']}
      gridTemplateRows={['repeat(2, 1fr)']}
      gap="0.5px"
      height="fit-content"
      background="ink.border-default"
      className={css({ '& > *': { bg: 'ink.background-primary' } })}
      {...props}
    >
      <Flex gridRow="span 2">{primaryCell}</Flex>
      <Flex>{cells[0]}</Flex>
      <Flex gridColumn="2" gridRow="2">
        {cells[1]}
      </Flex>
      <Flex gridColumn="3" gridRow="1">
        {cells[2]}
      </Flex>
      <Flex gridColumn="3" gridRow="2">
        {cells[3]}
      </Flex>
    </Grid>
  );
}
