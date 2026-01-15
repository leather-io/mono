import { Grid } from 'leather-styles/jsx';

interface SecretKeyGridProps {
  children: React.ReactNode;
}
export function SecretKeyGrid({ children }: SecretKeyGridProps) {
  return (
    <Grid
      gridTemplateColumns={{
        base: 'repeat(1, minmax(160px, 1fr))',
        sm: 'repeat(2, minmax(170px, 1fr))',
        md: 'repeat(3, minmax(170px, 1fr))',
      }}
      rowGap="space.02"
      columnGap="space.02"
    >
      {children}
    </Grid>
  );
}
