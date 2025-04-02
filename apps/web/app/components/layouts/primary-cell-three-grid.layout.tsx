import { css } from 'leather-styles/css';
import { Flex, Grid, GridProps } from 'leather-styles/jsx';

interface PrimaryCellGridLayoutProps extends GridProps {
  primaryCell: React.ReactNode;
  cells: [React.ReactNode, React.ReactNode];
}

export function PrimaryCellThreeGridLayout({
  primaryCell,
  cells,
  ...gridProps
}: PrimaryCellGridLayoutProps) {
  return (
    <Grid
      border="default"
      gridTemplateColumns={['1fr', '1fr', 'repeat(2, 1fr)']}
      gridTemplateRows={['repeat(3, auto)', 'repeat(3, auto)', 'repeat(2, 1fr)']}
      mb="space.06"
      gap="0.5px"
      bg="ink.border-default"
      className={css({ '& > *': { bg: 'ink.background-primary' } })}
      {...gridProps}
    >
      <Flex flexDir="column" gridRow={['1', '1', 'span 2 / span 2']} justifyContent="space-between">
        {primaryCell}
      </Flex>

      <Flex flexDir="column" justifyContent="space-between">
        {cells[0]}
      </Flex>

      <Flex flexDir="column">{cells[1]}</Flex>
    </Grid>
  );
}
