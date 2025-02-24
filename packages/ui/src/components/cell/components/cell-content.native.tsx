import { Box, BoxProps } from '../../box/box.native';

export type CellContentProps = BoxProps;

export function CellContent(props: CellContentProps) {
  return <Box justifyContent="center" gap="0.5" flexShrink={1} {...props} />;
}
