import { Box, BoxProps } from '../../box/box.native';

export type CellIconProps = BoxProps;

export function CellIcon(props: CellIconProps) {
  return props.children ? <Box {...props} /> : null;
}
