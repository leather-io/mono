import { Box, BoxProps } from '../../box/box.native';

export interface CellAsideProps extends BoxProps {}

export function CellAsideNative({ style, ...asideProps }: CellAsideProps) {
  return (
    <Box
      alignItems="flex-end"
      justifyContent="center"
      gap="0.5"
      style={[style, { marginLeft: 'auto' }]}
      {...asideProps}
    />
  );
}
