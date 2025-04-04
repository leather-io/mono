import { Flex, FlexProps, Grid, GridProps } from 'leather-styles/jsx';

// This component is intended to share styles only. No layout based assumptions
// should be made.
export function InfoGrid(props: GridProps) {
  return (
    <Grid
      border="default"
      borderWidth="1px"
      borderRadius="sm"
      overflow="hidden"
      gap="1px"
      bg="ink.border-default"
      {...props}
    />
  );
}

export function InfoGridCell(props: FlexProps) {
  return <Flex flexDir="column" bg="ink.background-primary" {...props} />;
}

InfoGrid.Cell = InfoGridCell;
