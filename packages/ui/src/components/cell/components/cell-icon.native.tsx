import { Box, BoxProps } from '../../box/box.native';

type CellIconProps = BoxProps;

export function CellIcon(props: CellIconProps) {
  return props.children ? <Box {...props} /> : null;
}
