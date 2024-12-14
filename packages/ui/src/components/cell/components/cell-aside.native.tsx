import { Box, BoxProps } from '../../box/box.native';

export type CellAsideProps = BoxProps;

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
