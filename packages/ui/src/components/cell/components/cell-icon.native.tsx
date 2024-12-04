import { Box, BoxProps } from '../../box/box.native';

export interface CellIconProps extends BoxProps {}

export function CellIcon(props: CellIconProps) {
  return props.children ? <Box {...props} /> : null;
}
